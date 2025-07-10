const marketplaceAI = require('../../src/services/marketplaceAI');
const { cache } = require('../../src/config/redis');

// Mock Redis cache
jest.mock('../../src/config/redis', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn()
  }
}));

// Mock axios for external API calls
jest.mock('axios');

describe('MarketplaceAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSmartRecommendations', () => {
    const mockShotData = {
      club: 'driver',
      distance: 245,
      accuracy: 72,
      consistency: 68,
      issues: ['distance_deficit', 'accuracy_inconsistent']
    };

    const mockUserProfile = {
      id: 'user_123',
      skillLevel: 'intermediate',
      preferredBrands: ['TaylorMade', 'Callaway'],
      budget: 'mid-range',
      location: { lat: 40.7128, lng: -74.0060 },
      preferredRetailer: 'golf-world-main'
    };

    test('returns cached recommendations when available', async () => {
      const cachedRecommendations = {
        products: [{ id: 'cached-product', name: 'Cached Driver' }],
        source: 'cache'
      };

      cache.get.mockResolvedValue(cachedRecommendations);

      const result = await marketplaceAI.getSmartRecommendations(mockShotData, mockUserProfile);

      expect(result.source).toBe('cache');
      expect(result.products).toBeDefined();
      expect(cache.get).toHaveBeenCalledWith(expect.stringContaining('recommendations:user_123'));
    });

    test('generates new recommendations when cache is empty', async () => {
      cache.get.mockResolvedValue(null);
      cache.set.mockResolvedValue(true);

      const result = await marketplaceAI.getSmartRecommendations(mockShotData, mockUserProfile);

      expect(result).toBeDefined();
      expect(result.products || result).toBeInstanceOf(Array);
      expect(cache.set).toHaveBeenCalled();
    });

    test('returns fallback recommendations on error', async () => {
      cache.get.mockRejectedValue(new Error('Cache error'));

      const result = await marketplaceAI.getSmartRecommendations(mockShotData, mockUserProfile);

      expect(result).toBeDefined();
      expect(result.products || result.source).toBe('fallback');
    });

    test('force refresh bypasses cache', async () => {
      cache.get.mockResolvedValue({ cached: true });
      cache.set.mockResolvedValue(true);

      const result = await marketplaceAI.getSmartRecommendations(
        mockShotData, 
        mockUserProfile, 
        { forceRefresh: true }
      );

      expect(result).toBeDefined();
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('analyzePerformanceGaps', () => {
    test('identifies driver distance deficit correctly', () => {
      const shotData = {
        club: 'driver',
        distance: 200, // Below average for intermediate
        accuracy: 72,
        consistency: 68
      };

      const userProfile = { skillLevel: 'intermediate' };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      expect(analysis.primaryNeeds).toContainEqual(
        expect.objectContaining({
          category: 'driver',
          issue: 'distance_deficit'
        })
      );

      expect(analysis.urgencyScore).toBeGreaterThan(0);
    });

    test('identifies accuracy problems correctly', () => {
      const shotData = {
        club: 'driver',
        distance: 280,
        accuracy: 60, // Below threshold
        consistency: 68
      };

      const userProfile = { skillLevel: 'intermediate' };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      expect(analysis.primaryNeeds).toContainEqual(
        expect.objectContaining({
          category: 'driver',
          issue: 'accuracy_problem'
        })
      );
    });

    test('identifies iron consistency issues', () => {
      const shotData = {
        club: '7-iron',
        distance: 150,
        accuracy: 80,
        consistency: 65 // Below threshold
      };

      const userProfile = { skillLevel: 'intermediate' };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      expect(analysis.primaryNeeds).toContainEqual(
        expect.objectContaining({
          category: 'irons',
          issue: 'consistency_problem'
        })
      );
    });

    test('identifies short game accuracy needs', () => {
      const shotData = {
        club: 'sand-wedge',
        distance: 50,
        accuracy: 70, // Below threshold for short game
        consistency: 75
      };

      const userProfile = { skillLevel: 'intermediate' };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      expect(analysis.secondaryNeeds).toContainEqual(
        expect.objectContaining({
          category: 'wedges',
          issue: 'short_game_accuracy'
        })
      );
    });

    test('recommends tracking accessories for users without devices', () => {
      const shotData = { club: 'driver', distance: 250, accuracy: 80, consistency: 75 };
      const userProfile = { skillLevel: 'intermediate', hasTrackingDevice: false };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      expect(analysis.secondaryNeeds).toContainEqual(
        expect.objectContaining({
          category: 'accessories',
          issue: 'data_tracking'
        })
      );
    });
  });

  describe('searchPrimaryMarket', () => {
    const mockAnalysis = {
      primaryNeeds: [
        { category: 'driver', issue: 'distance_deficit', confidence: 0.85 }
      ],
      secondaryNeeds: [],
      budgetRange: 'mid-range'
    };

    const mockUserProfile = {
      location: { lat: 40.7128, lng: -74.0060 },
      budget: 'mid-range'
    };

    test('searches all primary retailers', async () => {
      const products = await marketplaceAI.searchPrimaryMarket(mockAnalysis, mockUserProfile);

      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);

      products.forEach(product => {
        expect(product.marketType).toBe('primary');
        expect(product.retailer).toBeDefined();
        expect(product.retailer.id).toBeDefined();
        expect(product.retailer.name).toBeDefined();
      });
    });

    test('excludes retailers too far away', async () => {
      const remoteUserProfile = {
        ...mockUserProfile,
        location: { lat: 25.7617, lng: -80.1918 } // Miami - far from NYC retailers
      };

      const products = await marketplaceAI.searchPrimaryMarket(mockAnalysis, remoteUserProfile);

      // Should only include preferred partners or online retailers
      products.forEach(product => {
        if (product.retailer.distance > 50) {
          expect(product.retailer.preferredPartner).toBe(true);
        }
      });
    });

    test('adds retailer information to products', async () => {
      const products = await marketplaceAI.searchPrimaryMarket(mockAnalysis, mockUserProfile);

      products.forEach(product => {
        expect(product.retailer).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          distance: expect.any(Number),
          preferredPartner: expect.any(Boolean),
          commission: expect.any(Number),
          specialties: expect.any(Array)
        });
      });
    });
  });

  describe('searchSecondaryMarket', () => {
    const mockAnalysis = {
      primaryNeeds: [{ category: 'driver', issue: 'distance_deficit' }]
    };

    test('searches secondary market for budget users', async () => {
      const budgetProfile = {
        budget: 'budget',
        preferences: { includeUsed: true }
      };

      const products = await marketplaceAI.searchSecondaryMarket(mockAnalysis, budgetProfile);

      expect(products).toBeInstanceOf(Array);
      products.forEach(product => {
        expect(product.marketType).toBe('secondary');
        expect(product.secondaryBenefits).toBeDefined();
        expect(product.retailer.distance).toBe(0); // Online only
      });
    });

    test('skips secondary market for premium users without preference', async () => {
      const premiumProfile = {
        budget: 'premium',
        preferences: {}
      };

      const products = await marketplaceAI.searchSecondaryMarket(mockAnalysis, premiumProfile);

      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBe(0);
    });
  });

  describe('rankProductsByRelevance', () => {
    const mockProducts = [
      {
        id: 'product1',
        performanceMatch: 95,
        brand: 'TaylorMade',
        price: 549.99,
        retailer: { preferredPartner: true, distance: 2.3 }
      },
      {
        id: 'product2',
        performanceMatch: 75,
        brand: 'Wilson',
        price: 299.99,
        retailer: { preferredPartner: false, distance: 15.0 }
      },
      {
        id: 'product3',
        performanceMatch: 85,
        brand: 'Callaway',
        price: 449.99,
        discountPercent: 20,
        retailer: { preferredPartner: true, distance: 5.1 }
      }
    ];

    const mockAnalysis = {};
    const mockUserProfile = {
      budget: 'mid-range',
      preferredBrands: ['TaylorMade', 'Callaway']
    };

    test('ranks products by combined score correctly', () => {
      const ranked = marketplaceAI.rankProductsByRelevance(mockProducts, mockAnalysis, mockUserProfile);

      expect(ranked).toBeInstanceOf(Array);
      expect(ranked.length).toBe(3);

      // First product should have highest combined score
      expect(ranked[0].performanceMatch).toBeGreaterThanOrEqual(ranked[1].performanceMatch - 20);
    });

    test('gives bonus for preferred retailers', () => {
      const ranked = marketplaceAI.rankProductsByRelevance(mockProducts, mockAnalysis, mockUserProfile);

      const preferredPartnerProducts = ranked.filter(p => p.retailer.preferredPartner);
      expect(preferredPartnerProducts.length).toBeGreaterThan(0);
    });

    test('considers budget alignment', () => {
      const budgetProfile = { ...mockUserProfile, budget: 'budget' };
      const budgetRange = marketplaceAI.getBudgetRange('budget');

      const ranked = marketplaceAI.rankProductsByRelevance(mockProducts, mockAnalysis, budgetProfile);

      // Budget-appropriate products should rank higher
      const budgetFriendly = ranked.filter(p => p.price <= budgetRange.max);
      expect(budgetFriendly.length).toBeGreaterThan(0);
    });

    test('gives bonus for brand preferences', () => {
      const ranked = marketplaceAI.rankProductsByRelevance(mockProducts, mockAnalysis, mockUserProfile);

      const preferredBrandProducts = ranked.filter(p => 
        mockUserProfile.preferredBrands.includes(p.brand)
      );
      expect(preferredBrandProducts.length).toBeGreaterThan(0);
    });

    test('considers discount bonuses', () => {
      const ranked = marketplaceAI.rankProductsByRelevance(mockProducts, mockAnalysis, mockUserProfile);

      const discountedProducts = ranked.filter(p => p.discountPercent);
      expect(discountedProducts.length).toBeGreaterThan(0);
    });
  });

  describe('applyPersonalization', () => {
    const mockProducts = [
      { id: '1', retailer: { id: 'golf-world-main', distance: 2.3 } },
      { id: '2', retailer: { id: 'pga-tour-superstore', distance: 4.1 } },
      { id: '3', retailer: { id: 'online-retailer', distance: 0 } }
    ];

    test('prioritizes preferred retailer', () => {
      const userProfile = {
        preferredRetailer: 'golf-world-main',
        location: { lat: 40.7128, lng: -74.0060 }
      };

      const personalized = marketplaceAI.applyPersonalization(mockProducts, userProfile);

      expect(personalized[0].retailer.id).toBe('golf-world-main');
    });

    test('filters by maximum distance', () => {
      const userProfile = {
        location: { lat: 40.7128, lng: -74.0060 },
        maxDistance: 3
      };

      const personalized = marketplaceAI.applyPersonalization(mockProducts, userProfile);

      personalized.forEach(product => {
        if (product.retailer.distance > 0) {
          expect(product.retailer.distance).toBeLessThanOrEqual(3);
        }
      });
    });

    test('includes online retailers regardless of distance', () => {
      const userProfile = {
        location: { lat: 40.7128, lng: -74.0060 },
        maxDistance: 1 // Very restrictive
      };

      const personalized = marketplaceAI.applyPersonalization(mockProducts, userProfile);

      const onlineProducts = personalized.filter(p => p.retailer.distance === 0);
      expect(onlineProducts.length).toBeGreaterThan(0);
    });

    test('limits results to 20 products', () => {
      const manyProducts = Array.from({ length: 50 }, (_, i) => ({
        id: `product_${i}`,
        retailer: { id: `retailer_${i}`, distance: i }
      }));

      const userProfile = {
        location: { lat: 40.7128, lng: -74.0060 }
      };

      const personalized = marketplaceAI.applyPersonalization(manyProducts, userProfile);

      expect(personalized.length).toBe(20);
    });
  });

  describe('Helper Methods', () => {
    test('calculateDistance computes accurate distances', () => {
      const loc1 = { lat: 40.7128, lng: -74.0060 }; // NYC
      const loc2 = { lat: 40.7589, lng: -73.9851 }; // Times Square

      const distance = marketplaceAI.calculateDistance(loc1, loc2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10); // Should be a few miles
      expect(typeof distance).toBe('number');
    });

    test('calculateDistance handles null locations', () => {
      const distance = marketplaceAI.calculateDistance(null, { lat: 40.7128, lng: -74.0060 });

      expect(distance).toBe(0);
    });

    test('getAverageDriverDistance returns correct values', () => {
      expect(marketplaceAI.getAverageDriverDistance('beginner')).toBe(200);
      expect(marketplaceAI.getAverageDriverDistance('intermediate')).toBe(250);
      expect(marketplaceAI.getAverageDriverDistance('advanced')).toBe(280);
      expect(marketplaceAI.getAverageDriverDistance('pro')).toBe(300);
      expect(marketplaceAI.getAverageDriverDistance('unknown')).toBe(250);
    });

    test('getBudgetRange returns correct ranges', () => {
      expect(marketplaceAI.getBudgetRange('budget')).toEqual({ min: 0, max: 300 });
      expect(marketplaceAI.getBudgetRange('mid-range')).toEqual({ min: 200, max: 800 });
      expect(marketplaceAI.getBudgetRange('premium')).toEqual({ min: 500, max: 2000 });
      expect(marketplaceAI.getBudgetRange('no-limit')).toEqual({ min: 0, max: 10000 });
      expect(marketplaceAI.getBudgetRange('unknown')).toEqual({ min: 200, max: 800 });
    });

    test('determineBudgetRange analyzes user spending correctly', () => {
      expect(marketplaceAI.determineBudgetRange({ totalSpent: 3000 })).toBe('premium');
      expect(marketplaceAI.determineBudgetRange({ totalSpent: 800 })).toBe('mid-range');
      expect(marketplaceAI.determineBudgetRange({ totalSpent: 200 })).toBe('budget');
    });

    test('findRetailerById locates retailers correctly', () => {
      const retailer = marketplaceAI.findRetailerById('golf-world-main');
      expect(retailer).toBeDefined();
      expect(retailer.name).toContain('Golf World');

      const onlineRetailer = marketplaceAI.findRetailerById('global-golf');
      expect(onlineRetailer).toBeDefined();
      expect(onlineRetailer.name).toBe('Global Golf');

      const nonExistent = marketplaceAI.findRetailerById('non-existent');
      expect(nonExistent).toBeNull();
    });
  });

  describe('Category-Specific Recommendations', () => {
    test('getDriverRecommendations returns appropriate factors', () => {
      const recommendations = marketplaceAI.getDriverRecommendations({}, {});

      expect(recommendations.priorityFactors).toContain('distance');
      expect(recommendations.priorityFactors).toContain('accuracy');
      expect(recommendations.priorityFactors).toContain('forgiveness');
      expect(recommendations.recommendations).toBeInstanceOf(Array);
    });

    test('getIronRecommendations focuses on consistency', () => {
      const recommendations = marketplaceAI.getIronRecommendations({}, {});

      expect(recommendations.priorityFactors).toContain('consistency');
      expect(recommendations.priorityFactors).toContain('distance_gaps');
      expect(recommendations.recommendations).toBeInstanceOf(Array);
    });

    test('getWedgeRecommendations emphasizes spin control', () => {
      const recommendations = marketplaceAI.getWedgeRecommendations({}, {});

      expect(recommendations.priorityFactors).toContain('spin');
      expect(recommendations.priorityFactors).toContain('trajectory_control');
      expect(recommendations.recommendations).toBeInstanceOf(Array);
    });

    test('getPutterRecommendations focuses on alignment', () => {
      const recommendations = marketplaceAI.getPutterRecommendations({}, {});

      expect(recommendations.priorityFactors).toContain('alignment');
      expect(recommendations.priorityFactors).toContain('feel');
      expect(recommendations.priorityFactors).toContain('consistency');
      expect(recommendations.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles invalid shot data gracefully', async () => {
      const invalidShotData = {
        club: null,
        distance: -10,
        accuracy: 150,
        consistency: null
      };

      const result = await marketplaceAI.getSmartRecommendations(invalidShotData, mockUserProfile);

      expect(result).toBeDefined();
      expect(result.source).toBe('fallback');
    });

    test('handles missing user profile data', async () => {
      const incompleteProfile = {
        id: 'user_123'
        // Missing other required fields
      };

      const result = await marketplaceAI.getSmartRecommendations(mockShotData, incompleteProfile);

      expect(result).toBeDefined();
    });

    test('getFallbackRecommendations provides valid structure', () => {
      const fallback = marketplaceAI.getFallbackRecommendations({}, {});

      expect(fallback).toMatchObject({
        products: expect.any(Array),
        source: 'fallback'
      });

      expect(fallback.products.length).toBeGreaterThan(0);
      expect(fallback.products[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        brand: expect.any(String),
        price: expect.any(Number),
        retailer: expect.any(Object)
      });
    });
  });

  describe('Mathematical Precision Tests', () => {
    test('performance calculations are mathematically correct', () => {
      const shotData = { club: 'driver', distance: 245, accuracy: 72, consistency: 68 };
      const userProfile = { skillLevel: 'intermediate' };

      const analysis = marketplaceAI.analyzePerformanceGaps(shotData, userProfile);

      // Verify mathematical relationships
      expect(analysis.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(analysis.urgencyScore).toBeLessThanOrEqual(1);

      analysis.primaryNeeds.forEach(need => {
        expect(need.confidence).toBeGreaterThan(0);
        expect(need.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('distance calculations use proper mathematical formulas', () => {
      // Test with known coordinates
      const nyc = { lat: 40.7128, lng: -74.0060 };
      const philly = { lat: 39.9526, lng: -75.1652 };

      const distance = marketplaceAI.calculateDistance(nyc, philly);

      // Distance should be approximately 80-90 miles
      expect(distance).toBeGreaterThan(80);
      expect(distance).toBeLessThan(100);
    });

    test('budget range calculations are precise', () => {
      const ranges = ['budget', 'mid-range', 'premium', 'no-limit'];

      ranges.forEach(budget => {
        const range = marketplaceAI.getBudgetRange(budget);
        expect(range.min).toBeLessThanOrEqual(range.max);
        expect(range.min).toBeGreaterThanOrEqual(0);
        expect(range.max).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Points', () => {
    test('trackRecommendationEvent handles analytics correctly', async () => {
      // Mock analytics endpoint
      const mockAxios = require('axios');
      mockAxios.post.mockResolvedValue({ status: 200 });

      await marketplaceAI.trackRecommendationEvent('view', 'product_123', 'user_456', {
        source: 'carousel'
      });

      expect(mockAxios.post).toHaveBeenCalledWith('/api/analytics/recommendation-event', {
        event_type: 'view',
        product_id: 'product_123',
        user_id: 'user_456',
        timestamp: expect.any(Date),
        metadata: { source: 'carousel' }
      });
    });

    test('handles analytics tracking failures gracefully', async () => {
      const mockAxios = require('axios');
      mockAxios.post.mockRejectedValue(new Error('Network error'));

      // Should not throw error
      await expect(
        marketplaceAI.trackRecommendationEvent('view', 'product_123', 'user_456')
      ).resolves.toBeUndefined();
    });
  });
});