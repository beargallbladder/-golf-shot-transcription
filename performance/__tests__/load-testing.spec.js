const { check, sleep } = require('k6');
const http = require('k6/http');
const { Rate, Trend, Counter } = require('k6/metrics');

// Custom metrics
const errorRate = new Rate('errors');
const responseTrend = new Trend('response_time');
const apiCallsCounter = new Counter('api_calls_total');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
    
    // Load test - normal usage
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },   // Ramp up
        { duration: '5m', target: 10 },   // Stay at 10 users
        { duration: '2m', target: 20 },   // Ramp to 20 users
        { duration: '5m', target: 20 },   // Stay at 20 users
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' },
    },
    
    // Stress test - high load
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },   // Ramp up to 20 users
        { duration: '5m', target: 20 },   // Stay at 20 users
        { duration: '2m', target: 50 },   // Ramp to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '10m', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'stress' },
    },
    
    // Spike test - sudden load increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // Spike to 100 users
        { duration: '1m', target: 100 },  // Stay at 100 users
        { duration: '10s', target: 0 },   // Quick ramp down
      ],
      tags: { test_type: 'spike' },
    }
  },
  
  thresholds: {
    // HTTP request duration should be below 500ms for 95% of requests
    'http_req_duration': ['p(95)<500'],
    
    // Error rate should be below 1%
    'errors': ['rate<0.01'],
    
    // 99% of requests should complete successfully
    'http_req_failed': ['rate<0.01'],
    
    // API response time should be below 200ms for 90% of requests
    'response_time': ['p(90)<200'],
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data
const testUsers = [
  {
    id: 'user_1',
    skillLevel: 'beginner',
    budget: 'budget',
    location: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'user_2',
    skillLevel: 'intermediate',
    budget: 'mid-range',
    location: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: 'user_3',
    skillLevel: 'advanced',
    budget: 'premium',
    location: { lat: 41.8781, lng: -87.6298 }
  }
];

const testShotData = [
  {
    club: 'driver',
    distance: 245,
    accuracy: 72,
    consistency: 68,
    issues: ['distance_deficit']
  },
  {
    club: '7-iron',
    distance: 150,
    accuracy: 85,
    consistency: 80,
    issues: ['consistency']
  },
  {
    club: 'pitching-wedge',
    distance: 95,
    accuracy: 75,
    consistency: 85,
    issues: ['accuracy']
  }
];

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function getRandomShotData() {
  return testShotData[Math.floor(Math.random() * testShotData.length)];
}

// Main test function
export default function() {
  const user = getRandomUser();
  const shotData = getRandomShotData();
  
  // Test 1: Get marketplace recommendations
  testMarketplaceRecommendations(user, shotData);
  
  // Test 2: Find nearby retailers
  testNearbyRetailers(user);
  
  // Test 3: Set preferred retailer
  testSetPreferredRetailer(user);
  
  // Test 4: Get dynamic pricing
  testDynamicPricing(user);
  
  // Test 5: Product search
  testProductSearch();
  
  // Test 6: Price comparison
  testPriceComparison();
  
  sleep(1); // Think time between requests
}

function testMarketplaceRecommendations(user, shotData) {
  const payload = JSON.stringify({
    shotData: shotData,
    userProfile: user,
    preferences: {
      forceRefresh: Math.random() > 0.8 // 20% chance to force refresh
    }
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'marketplace_recommendations' },
  };
  
  const startTime = new Date().getTime();
  const response = http.post(`${BASE_URL}/api/marketplace/recommendations`, payload, params);
  const endTime = new Date().getTime();
  
  // Record metrics
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  // Validate response
  const success = check(response, {
    'recommendations status is 200': (r) => r.status === 200,
    'recommendations response time < 500ms': (r) => r.timings.duration < 500,
    'recommendations has products': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.recommendations?.products || body.recommendations);
      } catch (e) {
        return false;
      }
    },
    'recommendations products have required fields': (r) => {
      try {
        const body = JSON.parse(r.body);
        const products = body.recommendations?.products || body.recommendations;
        if (!Array.isArray(products) || products.length === 0) return true;
        
        const product = products[0];
        return product.id && product.name && product.price && product.retailer;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
    console.error(`Recommendations API failed: ${response.status} - ${response.body}`);
  } else {
    errorRate.add(0);
  }
}

function testNearbyRetailers(user) {
  const url = `${BASE_URL}/api/marketplace/retailers/nearby?lat=${user.location.lat}&lng=${user.location.lng}&maxDistance=25`;
  
  const params = {
    tags: { endpoint: 'nearby_retailers' },
  };
  
  const startTime = new Date().getTime();
  const response = http.get(url, params);
  const endTime = new Date().getTime();
  
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  const success = check(response, {
    'nearby retailers status is 200': (r) => r.status === 200,
    'nearby retailers response time < 300ms': (r) => r.timings.duration < 300,
    'nearby retailers has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.retailers);
      } catch (e) {
        return false;
      }
    },
    'nearby retailers have location data': (r) => {
      try {
        const body = JSON.parse(r.body);
        if (!body.retailers || body.retailers.length === 0) return true;
        
        const retailer = body.retailers[0];
        return retailer.id && retailer.name && typeof retailer.distance === 'number';
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

function testSetPreferredRetailer(user) {
  const payload = JSON.stringify({
    userId: user.id,
    retailerId: 'golf-world-main',
    reason: 'load_test'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'set_preferred_retailer' },
  };
  
  const startTime = new Date().getTime();
  const response = http.post(`${BASE_URL}/api/marketplace/retailers/preferred`, payload, params);
  const endTime = new Date().getTime();
  
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  const success = check(response, {
    'set preferred retailer status is 200': (r) => r.status === 200,
    'set preferred retailer response time < 200ms': (r) => r.timings.duration < 200,
    'set preferred retailer successful': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

function testDynamicPricing(user) {
  const payload = JSON.stringify({
    retailerId: 'golf-world-main',
    productCategory: 'driver',
    userProfile: user
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'dynamic_pricing' },
  };
  
  const startTime = new Date().getTime();
  const response = http.post(`${BASE_URL}/api/marketplace/pricing/dynamic`, payload, params);
  const endTime = new Date().getTime();
  
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  const success = check(response, {
    'dynamic pricing status is 200': (r) => r.status === 200,
    'dynamic pricing response time < 150ms': (r) => r.timings.duration < 150,
    'dynamic pricing has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.pricing && typeof body.pricing.dynamicDiscount === 'number';
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

function testProductSearch() {
  const searchTerms = ['driver', 'iron', 'wedge', 'putter', 'TaylorMade', 'Callaway'];
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  
  const url = `${BASE_URL}/api/marketplace/products/search?query=${searchTerm}&limit=10`;
  
  const params = {
    tags: { endpoint: 'product_search' },
  };
  
  const startTime = new Date().getTime();
  const response = http.get(url, params);
  const endTime = new Date().getTime();
  
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  const success = check(response, {
    'product search status is 200': (r) => r.status === 200,
    'product search response time < 400ms': (r) => r.timings.duration < 400,
    'product search has results': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && Array.isArray(body.results);
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

function testPriceComparison() {
  const payload = JSON.stringify({
    productId: 'tm-stealth2-001',
    userLocation: { lat: 40.7128, lng: -74.0060 }
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { endpoint: 'price_comparison' },
  };
  
  const startTime = new Date().getTime();
  const response = http.post(`${BASE_URL}/api/marketplace/products/compare`, payload, params);
  const endTime = new Date().getTime();
  
  apiCallsCounter.add(1);
  responseTrend.add(endTime - startTime);
  
  const success = check(response, {
    'price comparison status is 200': (r) => r.status === 200,
    'price comparison response time < 300ms': (r) => r.timings.duration < 300,
    'price comparison has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success && body.comparison && Array.isArray(body.comparison.prices);
      } catch (e) {
        return false;
      }
    }
  });
  
  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }
}

// Teardown function
export function teardown(data) {
  console.log('Load test completed');
  
  // Log summary metrics
  console.log(`Total API calls: ${apiCallsCounter.count}`);
  console.log(`Average response time: ${responseTrend.avg}ms`);
  console.log(`Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
}

// Helper function for setup
export function setup() {
  console.log('Starting load test...');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Test scenarios: ${Object.keys(options.scenarios).join(', ')}`);
  
  // Health check before starting tests
  const healthCheck = http.get(`${BASE_URL}/health`);
  
  if (healthCheck.status !== 200) {
    console.error(`Health check failed: ${healthCheck.status}`);
    throw new Error('Service is not healthy, aborting tests');
  }
  
  console.log('Health check passed, starting tests...');
  return { baseUrl: BASE_URL };
}