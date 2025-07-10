# 🔌 GolfSimple API Documentation

## 🚀 Overview

The GolfSimple API provides comprehensive access to shot analysis, customer management, and retailer tools. Built with RESTful principles and real-time capabilities.

**Base URL:** `https://api.golfsimple.com/v1`  
**Authentication:** Bearer token (JWT)  
**Rate Limits:** 1000 requests/hour (customer), 10,000 requests/hour (retailer)

---

## 🔐 Authentication

### Generate API Key
```bash
POST /auth/api-key
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "scope": "customer" | "retailer" | "enterprise"
}
```

### Use API Key
```bash
Authorization: Bearer your_api_key_here
```

---

## 🏌️ Shot Analysis API

### 📱 Submit Shot for Analysis
```bash
POST /shots/analyze
Content-Type: multipart/form-data

{
  "image": file,
  "voice_note": "Driver, 280 yards, slight draw",
  "club": "driver",
  "conditions": {
    "wind": "5mph headwind",
    "temperature": 72,
    "humidity": 45
  },
  "location": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "retailer_id": "golf-world-123" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "shot_id": "shot_abc123",
  "analysis": {
    "distance": 278,
    "accuracy": 92,
    "club": "driver",
    "ball_flight": {
      "trajectory": "optimal",
      "spin": "appropriate",
      "curve": "slight draw"
    },
    "technique_assessment": {
      "setup": "good",
      "swing": "solid",
      "contact": "clean",
      "finish": "balanced"
    },
    "confidence": 0.89
  },
  "recommendations": [
    {
      "type": "technique",
      "text": "Focus on follow-through for better distance",
      "priority": 0.9
    }
  ],
  "weather_adjustments": {
    "actual_carry": 285,
    "wind_effect": -7,
    "air_density_factor": 1.02
  }
}
```

### 📊 Get Shot History
```bash
GET /shots/history?limit=50&offset=0&club=driver&date_from=2024-01-01

Response:
{
  "shots": [
    {
      "id": "shot_abc123",
      "timestamp": "2024-07-10T14:30:00Z",
      "distance": 278,
      "club": "driver",
      "accuracy": 92,
      "conditions": {...},
      "analysis": {...}
    }
  ],
  "total": 156,
  "page": 1,
  "has_next": true
}
```

### 🎯 Get Performance Analytics
```bash
GET /analytics/performance?period=30d&club=all

Response:
{
  "summary": {
    "total_shots": 89,
    "avg_distance": 245,
    "accuracy_rate": 87,
    "consistency": 15.2,
    "improvement_trend": "increasing"
  },
  "by_club": {
    "driver": {
      "avg_distance": 278,
      "accuracy": 89,
      "total_shots": 25
    }
  },
  "trends": {
    "distance": [245, 248, 252, 255],
    "accuracy": [85, 87, 89, 87]
  }
}
```

---

## 🏆 Leaderboard API

### 📊 Get Global Leaderboards
```bash
GET /leaderboards/global?category=distance&period=weekly&limit=100

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user_123",
      "name": "John Smith",
      "avatar": "https://...",
      "value": 325,
      "shots_count": 15
    }
  ],
  "user_position": {
    "rank": 45,
    "value": 289
  },
  "category": "distance",
  "period": "weekly",
  "updated_at": "2024-07-10T15:00:00Z"
}
```

### 🏪 Get Retailer Leaderboards
```bash
GET /leaderboards/retailer/{retailer_id}?category=accuracy&period=monthly

Response:
{
  "leaderboard": [...],
  "retailer_info": {
    "name": "Golf World Pro Shop",
    "location": "City, State",
    "total_participants": 45
  }
}
```

---

## 🎒 My Bag API

### 📊 Get Bag Analysis
```bash
GET /mybag/analysis

Response:
{
  "clubs": [
    {
      "club": "driver",
      "avg_distance": 278,
      "accuracy": 89,
      "shots_count": 25,
      "dispersion": {
        "left": 15,
        "right": 12,
        "short": 8,
        "long": 5
      },
      "confidence_score": 0.92
    }
  ],
  "gaps": [
    {
      "between": ["7-iron", "6-iron"],
      "gap_yards": 25,
      "recommendation": "Consider a 6.5-iron or adjust technique"
    }
  ],
  "recommendations": [
    {
      "type": "equipment",
      "club": "60-degree wedge",
      "reason": "Gap in short game distance control",
      "priority": "high"
    }
  ]
}
```

### 🛠️ Update Club in Bag
```bash
PUT /mybag/clubs
Content-Type: application/json

{
  "club": "7-iron",
  "brand": "TaylorMade",
  "model": "P770",
  "specifications": {
    "loft": 34,
    "lie": 62,
    "shaft": "Steel Regular"
  }
}
```

---

## 🏪 Retailer API

### 👥 Customer Management

#### Get Customer Profile
```bash
GET /retailer/customers/{customer_id}

Response:
{
  "customer": {
    "id": "cust_123",
    "email": "john@example.com",
    "name": "John Smith",
    "created_at": "2024-01-15T10:00:00Z",
    "total_shots": 156,
    "avg_handicap": 16.5,
    "preferred_clubs": ["TaylorMade", "Callaway"],
    "visit_frequency": "weekly",
    "lifetime_value": 1250.00
  },
  "shot_summary": {
    "total_shots": 156,
    "avg_distance": 245,
    "accuracy_rate": 87,
    "favorite_club": "7-iron"
  },
  "equipment_profile": {
    "needs_assessment": [
      "Driver upgrade recommended",
      "Gap wedge missing"
    ],
    "budget_range": "mid-range",
    "fitting_priority": "high"
  }
}
```

#### Get Customer Analytics
```bash
GET /retailer/analytics/customers?period=30d&segment=all

Response:
{
  "overview": {
    "total_customers": 450,
    "new_customers": 23,
    "active_customers": 189,
    "avg_session_length": "45min"
  },
  "demographics": {
    "age_groups": {
      "18-30": 15,
      "31-45": 35,
      "46-60": 30,
      "60+": 20
    },
    "skill_levels": {
      "beginner": 25,
      "intermediate": 45,
      "advanced": 30
    }
  },
  "equipment_insights": {
    "popular_brands": ["TaylorMade", "Callaway", "Ping"],
    "common_gaps": ["60-degree wedge", "4-iron replacement"],
    "upgrade_opportunities": 67
  }
}
```

### 📧 Email Campaign Management

#### Send Campaign
```bash
POST /retailer/email/campaign
Content-Type: application/json

{
  "campaign_name": "Spring Equipment Sale",
  "recipient_segments": ["active_customers", "equipment_interested"],
  "template": "equipment_sale",
  "personalization": {
    "include_shot_data": true,
    "equipment_recommendations": true,
    "discount_percent": 20
  },
  "schedule": {
    "send_at": "2024-07-15T09:00:00Z",
    "timezone": "America/New_York"
  }
}
```

#### Get Campaign Analytics
```bash
GET /retailer/email/campaigns/{campaign_id}/analytics

Response:
{
  "campaign": {
    "name": "Spring Equipment Sale",
    "sent_at": "2024-07-15T09:00:00Z",
    "recipients": 234
  },
  "metrics": {
    "delivered": 229,
    "opened": 145,
    "clicked": 67,
    "converted": 23,
    "revenue_generated": 5670.00
  },
  "rates": {
    "delivery_rate": "97.9%",
    "open_rate": "63.3%",
    "click_rate": "29.3%",
    "conversion_rate": "10.1%"
  }
}
```

### 📊 Inventory Optimization

#### Get Equipment Performance
```bash
GET /retailer/inventory/performance?period=90d

Response:
{
  "top_performers": [
    {
      "product": "TaylorMade Stealth 2 Driver",
      "sales_count": 15,
      "revenue": 8235.00,
      "customer_satisfaction": 4.8,
      "performance_improvement": "12% distance increase"
    }
  ],
  "recommendations": [
    {
      "action": "restock",
      "product": "Callaway Rogue ST Max Irons",
      "reason": "High demand, low inventory",
      "priority": "urgent"
    }
  ],
  "trends": {
    "growing_categories": ["hybrid_clubs", "wedges"],
    "declining_categories": ["long_irons"]
  }
}
```

---

## 🎮 Simulator Integration API

### 📱 QR Code Management

#### Generate QR Code
```bash
POST /simulator/qr-code
Content-Type: application/json

{
  "retailer_id": "golf-world-123",
  "simulator_id": "sim-bay-1",
  "campaign_name": "Summer Promo",
  "landing_page": "beatmybag.com",
  "custom_params": {
    "promo_code": "SUMMER20",
    "staff_id": "john_smith"
  }
}

Response:
{
  "qr_code_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "tracking_url": "https://beatmybag.com?retailer=golf-world-123&sim=sim-bay-1&source=qr-simulator",
  "qr_id": "qr_abc123",
  "expires_at": "2025-07-10T00:00:00Z"
}
```

#### Track QR Code Performance
```bash
GET /simulator/qr-codes/{qr_id}/analytics

Response:
{
  "qr_code": {
    "id": "qr_abc123",
    "created_at": "2024-07-10T10:00:00Z",
    "retailer_id": "golf-world-123"
  },
  "usage": {
    "total_scans": 45,
    "unique_users": 39,
    "conversions": 23,
    "conversion_rate": "59.0%"
  },
  "timeline": {
    "daily_scans": [5, 8, 12, 7, 13],
    "peak_hours": ["2PM-4PM", "6PM-8PM"]
  }
}
```

---

## 🌤️ Weather Integration API

### 🌡️ Get Current Conditions
```bash
GET /weather/current?lat=40.7128&lng=-74.0060

Response:
{
  "conditions": {
    "temperature": 72,
    "humidity": 45,
    "pressure": 30.15,
    "wind": {
      "speed": 8,
      "direction": "NW",
      "gusts": 12
    },
    "air_density": 1.18
  },
  "golf_impact": {
    "carry_adjustment": "+3 yards",
    "accuracy_difficulty": "moderate",
    "recommended_tee": "blue"
  }
}
```

---

## 🤖 AI Enhancement API

### 🧠 Claude Flow AI Analysis
```bash
POST /ai/analyze-comprehensive
Content-Type: application/json

{
  "shot_data": {
    "distance": 278,
    "club": "driver",
    "accuracy": 89
  },
  "user_profile": {
    "skill_level": "intermediate",
    "goals": ["increase_distance", "improve_accuracy"],
    "equipment": ["TaylorMade driver", "Callaway irons"]
  },
  "analysis_type": "full" // "quick" | "full" | "coaching_only"
}

Response:
{
  "analysis": {
    "shot_analysis": {
      "technique_score": 8.5,
      "efficiency_rating": 0.92,
      "improvement_areas": ["follow_through", "setup"]
    },
    "coaching": {
      "primary_tip": "Focus on maintaining tempo",
      "drills": ["slow_motion_swings", "alignment_sticks"],
      "practice_schedule": "3x per week, 30 minutes"
    },
    "equipment": {
      "current_fit": "good",
      "upgrade_recommendations": ["consider_lower_loft"],
      "fitting_priority": "medium"
    },
    "performance": {
      "trend": "improving",
      "next_milestone": "Break 280 yards consistently",
      "confidence": 0.87
    }
  },
  "share_content": {
    "title": "Great driver shot!",
    "description": "278-yard bomb with the big stick! 🏌️",
    "image_url": "https://...",
    "hashtags": ["#golf", "#driver", "#golfsimple"]
  }
}
```

---

## 📊 WebSocket Real-Time API

### 🔄 Real-Time Leaderboard Updates
```javascript
// Connect to WebSocket
const ws = new WebSocket('wss://api.golfsimple.com/ws');

// Subscribe to leaderboard updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'leaderboard',
  category: 'distance',
  period: 'weekly'
}));

// Receive real-time updates
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  /*
  {
    "type": "leaderboard_update",
    "data": {
      "category": "distance",
      "new_leader": {
        "name": "John Smith",
        "distance": 325
      },
      "your_rank": 23
    }
  }
  */
};
```

### 📱 Shot Analysis Progress
```javascript
// Subscribe to shot analysis updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'shot_analysis',
  shot_id: 'shot_abc123'
}));

// Receive progress updates
/*
{
  "type": "analysis_progress",
  "data": {
    "shot_id": "shot_abc123",
    "stage": "ai_processing", // "uploaded" | "ai_processing" | "complete"
    "progress": 75,
    "estimated_completion": "2024-07-10T14:35:00Z"
  }
}
*/
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SHOT_DATA",
    "message": "Shot image is required for analysis",
    "details": {
      "missing_fields": ["image"],
      "suggestion": "Include image file in multipart form data"
    }
  },
  "request_id": "req_abc123"
}
```

### Common Error Codes
- `AUTHENTICATION_FAILED` (401) - Invalid API key
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INVALID_SHOT_DATA` (400) - Missing or invalid shot data
- `ANALYSIS_FAILED` (500) - AI analysis service error
- `CUSTOMER_NOT_FOUND` (404) - Invalid customer ID
- `INSUFFICIENT_PERMISSIONS` (403) - Feature not available in tier

---

## 📝 SDK Examples

### JavaScript/Node.js
```javascript
const GolfSimple = require('@golfsimple/sdk');

const client = new GolfSimple({
  apiKey: 'your_api_key',
  environment: 'production' // 'development' | 'production'
});

// Analyze a shot
const shot = await client.shots.analyze({
  image: fs.createReadStream('./shot.jpg'),
  voiceNote: 'Driver, 280 yards, slight draw',
  club: 'driver'
});

console.log(`Distance: ${shot.analysis.distance} yards`);
```

### Python
```python
from golfsimple import GolfSimpleClient

client = GolfSimpleClient(api_key='your_api_key')

# Get performance analytics
analytics = client.analytics.performance(period='30d')
print(f"Average distance: {analytics.summary.avg_distance}")
```

### cURL Examples
```bash
# Quick shot analysis
curl -X POST https://api.golfsimple.com/v1/shots/analyze \
  -H "Authorization: Bearer your_api_key" \
  -F "image=@shot.jpg" \
  -F "voice_note=Driver, 280 yards, slight draw" \
  -F "club=driver"
```

---

## 🔄 Webhooks

### Configure Webhook Endpoints
```bash
POST /webhooks/configure
Content-Type: application/json

{
  "url": "https://yourdomain.com/webhook/golfsimple",
  "events": [
    "shot.analyzed",
    "customer.created",
    "leaderboard.updated",
    "achievement.unlocked"
  ],
  "secret": "your_webhook_secret"
}
```

### Webhook Event Examples
```json
// Shot Analysis Complete
{
  "event": "shot.analyzed",
  "data": {
    "shot_id": "shot_abc123",
    "user_id": "user_123",
    "retailer_id": "golf-world-123",
    "analysis": {...}
  },
  "timestamp": "2024-07-10T14:30:00Z"
}

// New Customer Registration
{
  "event": "customer.created",
  "data": {
    "customer_id": "cust_456",
    "retailer_id": "golf-world-123",
    "source": "qr_simulator",
    "created_at": "2024-07-10T14:30:00Z"
  }
}
```

---

## 🔧 Testing & Development

### Sandbox Environment
- **Base URL:** `https://api-sandbox.golfsimple.com/v1`
- **Test API Keys:** Available in developer dashboard
- **Mock Data:** Consistent test responses for development

### Postman Collection
Download our complete Postman collection: [GolfSimple API Collection](https://api.golfsimple.com/postman)

### Rate Limits
- **Customer API:** 1,000 requests/hour
- **Retailer API:** 10,000 requests/hour  
- **Enterprise API:** 100,000 requests/hour
- **WebSocket:** 1,000 messages/hour

---

*For additional support, contact our API team at api-support@golfsimple.com*