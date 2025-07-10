const Redis = require('ioredis');

// Redis configuration optimized for Render deployment
const redisConfig = {
  // Use Render Redis URL in production, local Redis in development
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Connection settings optimized for cloud deployment
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  
  // Performance optimizations
  enableAutoPipelining: true,
  maxRetriesPerRequest: 3,
  
  // Error handling
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  console.log('🔗 Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for operations');
});

redis.on('error', (error) => {
  console.error('❌ Redis error:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Cache utilities optimized for GolfSimple
class CacheManager {
  constructor() {
    this.redis = redis;
    this.defaultTTL = 300; // 5 minutes default
  }

  // Set with TTL
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  // Get with automatic deserialization
  async get(key) {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  // Delete key
  async del(key) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  // Golf-specific cache patterns
  async cacheLeaderboard(category, timeframe, data, ttl = 60) {
    const key = `leaderboard:${category}:${timeframe}`;
    return await this.set(key, data, ttl);
  }

  async getLeaderboard(category, timeframe) {
    const key = `leaderboard:${category}:${timeframe}`;
    return await this.get(key);
  }

  async cacheUserStats(userId, stats, ttl = 300) {
    const key = `user:${userId}:stats`;
    return await this.set(key, stats, ttl);
  }

  async getUserStats(userId) {
    const key = `user:${userId}:stats`;
    return await this.get(key);
  }

  async cacheShotAnalysis(shotId, analysis, ttl = 3600) {
    const key = `shot:${shotId}:analysis`;
    return await this.set(key, analysis, ttl);
  }

  async getShotAnalysis(shotId) {
    const key = `shot:${shotId}:analysis`;
    return await this.get(key);
  }

  // Cache invalidation patterns
  async invalidateUserCache(userId) {
    const pattern = `user:${userId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      return await this.redis.del(...keys);
    }
    return 0;
  }

  async invalidateLeaderboards() {
    const pattern = 'leaderboard:*';
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      return await this.redis.del(...keys);
    }
    return 0;
  }

  // Performance monitoring
  async getStats() {
    try {
      const info = await this.redis.info('memory');
      const stats = {};
      
      info.split('\r\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });
      
      return {
        memory: stats,
        connected: this.redis.status === 'ready',
        keyCount: await this.redis.dbsize()
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
        connected: this.redis.status === 'ready'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false
      };
    }
  }

  // Graceful shutdown
  async disconnect() {
    try {
      await this.redis.quit();
      console.log('📴 Redis connection closed gracefully');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

// Create cache manager instance
const cache = new CacheManager();

// Export both raw Redis client and cache manager
module.exports = {
  redis,
  cache,
  CacheManager
};

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  await cache.disconnect();
});

process.on('SIGINT', async () => {
  await cache.disconnect();
});