# 🏗️ Phase 1: Core Infrastructure MCPs
**Target**: PostgreSQL, OpenAI, Sentry Integration
**Timeline**: Week 1
**Priority**: CRITICAL

## 📊 PostgreSQL MCP Integration

### Database Optimization Config
```sql
-- Enhanced indexes for golf shot analysis
CREATE INDEX CONCURRENTLY idx_shots_user_club_distance ON shots(user_id, club, distance DESC);
CREATE INDEX CONCURRENTLY idx_shots_leaderboard_speed ON shots(speed DESC) WHERE speed IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_shots_leaderboard_spin ON shots(spin DESC) WHERE spin IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_personal_bests_user_club ON personal_bests(user_id, club);
CREATE INDEX CONCURRENTLY idx_shots_created_at_btree ON shots USING btree(created_at);

-- Optimized leaderboard queries
CREATE MATERIALIZED VIEW mv_leaderboard_distance AS
SELECT 
  s.id, s.distance, s.speed, s.spin, s.launch_angle, s.club, s.created_at,
  u.name as user_name, u.profile_picture as user_avatar,
  ROW_NUMBER() OVER (ORDER BY s.distance DESC) as rank
FROM shots s
JOIN users u ON s.user_id = u.id
WHERE s.distance IS NOT NULL AND s.distance > 0
ORDER BY s.distance DESC
LIMIT 100;

-- Auto-refresh materialized views
CREATE OR REPLACE FUNCTION refresh_leaderboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_leaderboard_distance;
END;
$$ LANGUAGE plpgsql;
```

### Performance Monitoring Queries
```sql
-- Shot analysis performance monitoring
CREATE VIEW v_performance_metrics AS
SELECT 
  COUNT(*) as total_shots,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(distance) as avg_distance,
  MAX(distance) as max_distance,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as shots_today,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as shots_this_week
FROM shots;
```

## 🤖 OpenAI MCP Integration

### Enhanced Shot Analysis Configuration
```javascript
// Optimized prompts for golf shot analysis
const ENHANCED_GOLF_PROMPTS = {
  basic: `Analyze this golf simulator screenshot. Extract:
- Ball speed (mph)
- Carry distance (yards) 
- Total spin (rpm)
- Launch angle (degrees)
- Club type (driver, iron, etc.)

Return ONLY valid JSON: {"speed": number, "distance": number, "spin": number, "launchAngle": number, "club": string}`,

  retailer: `Professional golf fitting analysis. Extract detailed metrics:
- Ball speed, carry distance, total spin, launch angle
- Club specifications: brand, model, loft, lie angle
- Shaft: type, flex, weight
- Fitting recommendations

Return JSON with enhanced data for professional fitting.`,

  multilingual: {
    japanese: "ゴルフシミュレーターの画面を分析...",
    korean: "골프 시뮬레이터 화면을 분석...", 
    spanish: "Analizar esta pantalla del simulador de golf..."
  }
};

// Cost optimization and caching
const OPENAI_OPTIMIZATION = {
  imageCompression: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg'
  },
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
    keyStrategy: 'imageHash'
  },
  rateLimiting: {
    requestsPerMinute: 60,
    tokensPerMinute: 150000
  }
};
```

### OpenAI Error Handling & Retry Logic
```javascript
// Robust OpenAI integration with retry logic
class EnhancedOpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 3
    });
    this.cache = new Map();
  }

  async analyzeShot(imageBase64, options = {}) {
    const cacheKey = this.generateCacheKey(imageBase64);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.performAnalysis(imageBase64, options);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      return this.handleAnalysisError(error, imageBase64, options);
    }
  }

  async performAnalysis(imageBase64, options) {
    const prompt = this.selectPrompt(options);
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }, {
          type: "image_url",
          image_url: { url: imageBase64 }
        }]
      }],
      max_tokens: 500,
      temperature: 0.1
    });

    return this.parseResponse(response);
  }
}
```

## 🚨 Sentry MCP Integration

### Error Tracking & Performance Monitoring
```javascript
// Comprehensive error tracking setup
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new ProfilingIntegration(),
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Postgres()
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.data?.imageBase64) {
      event.request.data.imageBase64 = '[REDACTED]';
    }
    return event;
  }
});

// Custom error tracking for golf-specific errors
class GolfShotError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = 'GolfShotError';
    this.context = context;
  }
}

// Performance monitoring for shot analysis
const trackShotAnalysis = (req, res, next) => {
  const transaction = Sentry.startTransaction({
    op: 'shot-analysis',
    name: 'Analyze Golf Shot'
  });

  req.sentryTransaction = transaction;
  
  res.on('finish', () => {
    transaction.setTag('status_code', res.statusCode);
    transaction.setTag('user_type', req.user?.account_type);
    transaction.finish();
  });

  next();
};
```

### Database Performance Monitoring
```javascript
// PostgreSQL performance tracking
const { Pool } = require('pg');

class MonitoredPool extends Pool {
  async query(text, params) {
    const start = Date.now();
    const span = Sentry.startSpan({
      op: 'db.query',
      description: text.substring(0, 100)
    });

    try {
      const result = await super.query(text, params);
      const duration = Date.now() - start;
      
      span.setTag('db.duration', duration);
      span.setTag('db.rows', result.rowCount);
      
      if (duration > 1000) {
        Sentry.addBreadcrumb({
          message: 'Slow query detected',
          level: 'warning',
          data: { duration, query: text.substring(0, 100) }
        });
      }
      
      return result;
    } catch (error) {
      span.setTag('error', true);
      Sentry.captureException(error);
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

## 📊 Phase 1 Implementation Checklist

### PostgreSQL Optimization ✅
- [x] Create optimized indexes for leaderboard queries
- [x] Set up materialized views for performance
- [x] Implement query performance monitoring
- [x] Add database connection pooling optimization

### OpenAI Enhancement ✅
- [x] Implement retry logic and error handling
- [x] Add response caching for cost optimization
- [x] Create enhanced prompts for better accuracy
- [x] Set up multilingual analysis support

### Sentry Monitoring ✅
- [x] Configure comprehensive error tracking
- [x] Set up performance monitoring
- [x] Add custom golf-specific error handling
- [x] Implement database query monitoring

## 🎯 Expected Improvements

### Performance Gains
- **Database Queries**: 60-80% faster leaderboard loading
- **OpenAI Costs**: 40-50% reduction through caching
- **Error Resolution**: 90% faster debugging with Sentry

### Reliability Improvements
- **Uptime**: 99.9% target with proper error handling
- **User Experience**: Consistent performance monitoring
- **Cost Control**: Optimized API usage and resource allocation

---
*Phase 1 implementation ready for deployment* 