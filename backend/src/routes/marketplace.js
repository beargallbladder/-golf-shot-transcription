const express = require('express');
const router = express.Router();
const marketplaceAI = require('../services/marketplaceAI');
const retailerLocationService = require('../services/retailerLocationService');
const queueManager = require('../services/queueManager');

// Get AI-powered product recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { shotData, userProfile, preferences = {} } = req.body;

    // Validate required data
    if (!shotData || !userProfile) {
      return res.status(400).json({
        success: false,
        error: 'Shot data and user profile are required'
      });
    }

    // Get smart recommendations from AI
    const recommendations = await marketplaceAI.getSmartRecommendations(
      shotData,
      userProfile,
      preferences
    );

    // Track recommendation request
    await queueManager.addJob('analytics', 'track-event', {
      event: 'marketplace_recommendations_requested',
      userId: userProfile.id,
      properties: {
        club: shotData.club,
        performance_issues: shotData.issues?.length || 0,
        budget: userProfile.budget,
        location: userProfile.location
      }
    });

    res.json({
      success: true,
      recommendations: recommendations.products || recommendations,
      metadata: {
        total_products: recommendations.products?.length || 0,
        source: recommendations.source || 'ai',
        cache_hit: recommendations.source === 'cache',
        user_location: userProfile.location
      }
    });

  } catch (error) {
    console.error('❌ Marketplace recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get nearby retailers
router.get('/retailers/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 25, features, preferredOnly } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const options = {
      maxDistance: parseInt(maxDistance),
      features: features ? features.split(',') : [],
      preferredOnly: preferredOnly === 'true'
    };

    const nearbyRetailers = await retailerLocationService.findNearestRetailers(
      userLocation,
      options
    );

    res.json({
      success: true,
      ...nearbyRetailers
    });

  } catch (error) {
    console.error('❌ Nearby retailers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Set preferred retailer
router.post('/retailers/preferred', async (req, res) => {
  try {
    const { userId, retailerId, reason = 'user_selected' } = req.body;

    if (!userId || !retailerId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and retailer ID are required'
      });
    }

    const result = await retailerLocationService.setPreferredRetailer(
      userId,
      retailerId,
      reason
    );

    if (result.success) {
      // Track preference change
      await queueManager.addJob('analytics', 'track-event', {
        event: 'preferred_retailer_set',
        userId,
        properties: {
          retailerId,
          reason,
          benefits: result.preference.benefits
        }
      });
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Set preferred retailer error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get retailer benefits and incentives
router.get('/retailers/:retailerId/benefits', async (req, res) => {
  try {
    const { retailerId } = req.params;
    const { userId } = req.query;

    const benefits = await retailerLocationService.getRetailerBenefits(retailerId);

    if (!benefits) {
      return res.status(404).json({
        success: false,
        error: 'Retailer not found'
      });
    }

    res.json({
      success: true,
      retailerId,
      benefits
    });

  } catch (error) {
    console.error('❌ Retailer benefits error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get retailer recommendations based on user needs
router.post('/retailers/recommendations', async (req, res) => {
  try {
    const { userProfile, shotData, productNeeds = [] } = req.body;

    if (!userProfile || !userProfile.location) {
      return res.status(400).json({
        success: false,
        error: 'User profile with location is required'
      });
    }

    const recommendations = await retailerLocationService.getRecommendedRetailers(
      userProfile,
      shotData,
      productNeeds
    );

    res.json({
      success: true,
      ...recommendations
    });

  } catch (error) {
    console.error('❌ Retailer recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Calculate dynamic pricing/discounts
router.post('/pricing/dynamic', async (req, res) => {
  try {
    const { retailerId, productCategory, userProfile } = req.body;

    if (!retailerId || !productCategory || !userProfile) {
      return res.status(400).json({
        success: false,
        error: 'Retailer ID, product category, and user profile are required'
      });
    }

    const discount = await retailerLocationService.calculateDynamicDiscount(
      retailerId,
      productCategory,
      userProfile
    );

    res.json({
      success: true,
      retailerId,
      productCategory,
      pricing: discount
    });

  } catch (error) {
    console.error('❌ Dynamic pricing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Track user interactions with products/retailers
router.post('/interactions/track', async (req, res) => {
  try {
    const { userId, retailerId, interactionType, metadata = {} } = req.body;

    if (!userId || !retailerId || !interactionType) {
      return res.status(400).json({
        success: false,
        error: 'User ID, retailer ID, and interaction type are required'
      });
    }

    // Track the interaction
    await retailerLocationService.trackRetailerInteraction(
      userId,
      retailerId,
      interactionType,
      metadata
    );

    // Queue analytics event
    await queueManager.addJob('analytics', 'track-event', {
      event: `retailer_${interactionType}`,
      userId,
      properties: {
        retailerId,
        ...metadata
      }
    });

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('❌ Track interaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Product search across all retailers
router.get('/products/search', async (req, res) => {
  try {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      retailer, 
      condition = 'all',
      sortBy = 'relevance',
      limit = 20 
    } = req.query;

    if (!query && !category) {
      return res.status(400).json({
        success: false,
        error: 'Search query or category is required'
      });
    }

    // Mock search results - in production, this would query retailer APIs
    const searchResults = await mockProductSearch({
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      retailer,
      condition,
      sortBy,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      query,
      results: searchResults.products,
      pagination: {
        total: searchResults.total,
        limit: parseInt(limit),
        page: 1
      },
      filters: {
        category,
        priceRange: { min: minPrice, max: maxPrice },
        retailer,
        condition
      }
    });

  } catch (error) {
    console.error('❌ Product search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Compare prices across retailers
router.post('/products/compare', async (req, res) => {
  try {
    const { productId, userLocation } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    // Mock price comparison - in production, query multiple retailer APIs
    const priceComparison = await mockPriceComparison(productId, userLocation);

    res.json({
      success: true,
      productId,
      comparison: priceComparison
    });

  } catch (error) {
    console.error('❌ Price comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get marketplace analytics for admin/retailers
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d', retailerId } = req.query;

    // Mock analytics data
    const analytics = {
      overview: {
        totalViews: 12456,
        totalClicks: 3421,
        totalPurchases: 234,
        totalRevenue: 45670.00,
        conversionRate: '6.8%'
      },
      topProducts: [
        { name: 'TaylorMade Stealth 2 Driver', views: 892, clicks: 156, purchases: 23 },
        { name: 'Callaway Rogue ST Irons', views: 756, clicks: 134, purchases: 18 },
        { name: 'Vokey SM9 Wedges', views: 623, clicks: 98, purchases: 15 }
      ],
      topRetailers: [
        { name: 'Golf World Pro Shop', sales: 156, revenue: 12340.00 },
        { name: 'PGA Tour Superstore', sales: 89, revenue: 8765.00 },
        { name: 'Global Golf', sales: 67, revenue: 5432.00 }
      ],
      trends: {
        daily_views: [45, 52, 38, 67, 89, 76, 94],
        category_distribution: {
          drivers: 25,
          irons: 35,
          wedges: 20,
          putters: 15,
          accessories: 5
        }
      }
    };

    res.json({
      success: true,
      period,
      retailerId,
      analytics
    });

  } catch (error) {
    console.error('❌ Marketplace analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mock functions for demonstration
async function mockProductSearch(params) {
  const mockProducts = [
    {
      id: 'tm-stealth2-001',
      name: 'TaylorMade Stealth 2 Driver',
      brand: 'TaylorMade',
      category: 'driver',
      price: 449.99,
      originalPrice: 549.99,
      condition: 'new',
      retailer: 'Golf World Pro Shop',
      distance: 2.3,
      inStock: true,
      rating: 4.8,
      reviews: 156
    },
    {
      id: 'cw-rogue-001',
      name: 'Callaway Rogue ST Max Irons',
      brand: 'Callaway',
      category: 'irons',
      price: 799.99,
      condition: 'new',
      retailer: 'PGA Tour Superstore',
      distance: 4.1,
      inStock: true,
      rating: 4.7,
      reviews: 89
    }
  ];

  return {
    products: mockProducts.filter(p => {
      if (params.category && p.category !== params.category) return false;
      if (params.minPrice && p.price < params.minPrice) return false;
      if (params.maxPrice && p.price > params.maxPrice) return false;
      if (params.query && !p.name.toLowerCase().includes(params.query.toLowerCase())) return false;
      return true;
    }),
    total: mockProducts.length
  };
}

async function mockPriceComparison(productId, userLocation) {
  return {
    product: {
      id: productId,
      name: 'TaylorMade Stealth 2 Driver'
    },
    prices: [
      {
        retailer: 'Golf World Pro Shop',
        price: 449.99,
        originalPrice: 549.99,
        discount: 18,
        distance: 2.3,
        shipping: 'Same-day pickup',
        inStock: true
      },
      {
        retailer: 'PGA Tour Superstore',
        price: 479.99,
        originalPrice: 549.99,
        discount: 13,
        distance: 4.1,
        shipping: 'Free shipping',
        inStock: true
      },
      {
        retailer: 'Global Golf',
        price: 229.99,
        originalPrice: 475.00,
        discount: 52,
        distance: 0,
        shipping: 'Free shipping $99+',
        inStock: true,
        condition: 'Used - Excellent'
      }
    ],
    bestDeal: {
      retailer: 'Golf World Pro Shop',
      reason: 'Best combination of price, proximity, and service'
    }
  };
}

module.exports = router;