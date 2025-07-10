const axios = require('axios');
const { cache } = require('../config/redis');

class MarketplaceAI {
  constructor() {
    this.retailers = {
      primary: {
        'golf-world-main': {
          name: 'Golf World Pro Shop',
          apiEndpoint: 'https://api.golfworld.com/v1',
          commission: 0.08,
          preferredPartner: true,
          location: { lat: 40.7128, lng: -74.0060 },
          specialties: ['fitting', 'trade-ins', 'lessons']
        },
        'pga-tour-superstore': {
          name: 'PGA Tour Superstore',
          apiEndpoint: 'https://api.pgatoursuperstore.com/v1',
          commission: 0.06,
          preferredPartner: false,
          location: { lat: 40.7589, lng: -73.9851 },
          specialties: ['wide-selection', 'competitive-pricing']
        },
        'dicks-sporting': {
          name: "Dick's Sporting Goods",
          apiEndpoint: 'https://api.dickssportinggoods.com/v1',
          commission: 0.05,
          preferredPartner: false,
          location: { lat: 40.7505, lng: -73.9934 },
          specialties: ['mainstream', 'pickup-in-store']
        }
      },
      secondary: {
        'global-golf': {
          name: 'Global Golf',
          apiEndpoint: 'https://api.globalgolf.com/v1',
          commission: 0.12,
          preferredPartner: true,
          location: null, // Online only
          specialties: ['used-equipment', 'trade-ins', 'certified-pre-owned']
        },
        '2nd-swing': {
          name: '2nd Swing Golf',
          apiEndpoint: 'https://api.2ndswing.com/v1',
          commission: 0.10,
          preferredPartner: true,
          location: null,
          specialties: ['premium-used', 'fitting-data', 'warranty']
        }
      },
      affiliate: {
        'rock-bottom-golf': {
          name: 'Rock Bottom Golf',
          apiEndpoint: 'https://api.rockbottomgolf.com/v1',
          commission: 0.15,
          preferredPartner: false,
          location: null,
          specialties: ['discount', 'clearance', 'closeouts']
        }
      }
    };

    this.productCategories = {
      driver: {
        performanceFactors: ['distance', 'accuracy', 'launch_angle'],
        recommendationRules: this.getDriverRecommendations.bind(this)
      },
      irons: {
        performanceFactors: ['accuracy', 'consistency', 'distance_gaps'],
        recommendationRules: this.getIronRecommendations.bind(this)
      },
      wedges: {
        performanceFactors: ['short_game_accuracy', 'spin_control'],
        recommendationRules: this.getWedgeRecommendations.bind(this)
      },
      putters: {
        performanceFactors: ['putting_accuracy', 'distance_control'],
        recommendationRules: this.getPutterRecommendations.bind(this)
      }
    };
  }

  // Main AI recommendation engine
  async getSmartRecommendations(shotData, userProfile, preferences = {}) {
    const cacheKey = `recommendations:${userProfile.id}:${JSON.stringify(shotData)}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached && !preferences.forceRefresh) {
        return { ...cached, source: 'cache' };
      }

      // Analyze shot performance to identify improvement opportunities
      const performanceAnalysis = this.analyzePerformanceGaps(shotData, userProfile);
      
      // Get product recommendations from multiple sources
      const [primaryProducts, secondaryProducts, affiliateProducts] = await Promise.all([
        this.searchPrimaryMarket(performanceAnalysis, userProfile),
        this.searchSecondaryMarket(performanceAnalysis, userProfile),
        this.searchAffiliateNetwork(performanceAnalysis, userProfile)
      ]);

      // Combine and rank all products
      const allProducts = [...primaryProducts, ...secondaryProducts, ...affiliateProducts];
      const rankedProducts = this.rankProductsByRelevance(allProducts, performanceAnalysis, userProfile);

      // Apply retailer preferences and location-based filtering
      const personalizedProducts = this.applyPersonalization(rankedProducts, userProfile);

      // Cache the results
      await cache.set(cacheKey, personalizedProducts, 1800); // 30 minutes

      return personalizedProducts;

    } catch (error) {
      console.error('❌ Marketplace AI error:', error);
      return this.getFallbackRecommendations(shotData, userProfile);
    }
  }

  // Analyze performance gaps to identify equipment needs
  analyzePerformanceGaps(shotData, userProfile) {
    const analysis = {
      primaryNeeds: [],
      secondaryNeeds: [],
      budgetRange: this.determineBudgetRange(userProfile),
      urgencyScore: 0,
      improvementPotential: {}
    };

    // Driver analysis
    if (shotData.club === 'driver') {
      const avgDriverDistance = this.getAverageDriverDistance(userProfile.skillLevel);
      if (shotData.distance < avgDriverDistance * 0.85) {
        analysis.primaryNeeds.push({
          category: 'driver',
          issue: 'distance_deficit',
          potential_gain: avgDriverDistance - shotData.distance,
          confidence: 0.85
        });
        analysis.urgencyScore += 0.3;
      }

      if (shotData.accuracy < 70) {
        analysis.primaryNeeds.push({
          category: 'driver',
          issue: 'accuracy_problem',
          potential_gain: '15-25% accuracy improvement',
          confidence: 0.75
        });
        analysis.urgencyScore += 0.2;
      }
    }

    // Iron performance analysis
    if (['3-iron', '4-iron', '5-iron', '6-iron', '7-iron', '8-iron', '9-iron'].includes(shotData.club)) {
      if (shotData.consistency < 75) {
        analysis.primaryNeeds.push({
          category: 'irons',
          issue: 'consistency_problem',
          potential_gain: 'More predictable distances',
          confidence: 0.80
        });
      }
    }

    // Short game analysis
    if (['pitching-wedge', 'sand-wedge', '60-degree'].includes(shotData.club)) {
      if (shotData.accuracy < 80) {
        analysis.secondaryNeeds.push({
          category: 'wedges',
          issue: 'short_game_accuracy',
          potential_gain: 'Better scoring opportunities',
          confidence: 0.70
        });
      }
    }

    // Accessory recommendations based on data gaps
    if (!userProfile.hasTrackingDevice) {
      analysis.secondaryNeeds.push({
        category: 'accessories',
        issue: 'data_tracking',
        potential_gain: 'Complete shot analytics',
        confidence: 0.60
      });
    }

    return analysis;
  }

  // Search primary retail partners
  async searchPrimaryMarket(analysis, userProfile) {
    const products = [];
    
    for (const [retailerId, retailer] of Object.entries(this.retailers.primary)) {
      try {
        // Calculate distance to retailer
        const distance = this.calculateDistance(userProfile.location, retailer.location);
        
        // Skip if too far and not preferred
        if (distance > 50 && !retailer.preferredPartner) continue;

        // Get retailer-specific products
        const retailerProducts = await this.fetchRetailerProducts(retailerId, analysis);
        
        // Add retailer info to each product
        retailerProducts.forEach(product => {
          product.retailer = {
            id: retailerId,
            name: retailer.name,
            distance: distance,
            preferredPartner: retailer.preferredPartner,
            commission: retailer.commission,
            specialties: retailer.specialties
          };
          product.marketType = 'primary';
        });
        
        products.push(...retailerProducts);
      } catch (error) {
        console.error(`❌ Error fetching from ${retailer.name}:`, error);
      }
    }

    return products;
  }

  // Search secondary/used market
  async searchSecondaryMarket(analysis, userProfile) {
    const products = [];
    
    // Only search secondary market if budget-conscious or specifically requested
    if (userProfile.budget === 'budget' || userProfile.preferences?.includeUsed) {
      for (const [retailerId, retailer] of Object.entries(this.retailers.secondary)) {
        try {
          const retailerProducts = await this.fetchRetailerProducts(retailerId, analysis);
          
          retailerProducts.forEach(product => {
            product.retailer = {
              id: retailerId,
              name: retailer.name,
              distance: 0, // Online only
              preferredPartner: retailer.preferredPartner,
              commission: retailer.commission,
              specialties: retailer.specialties
            };
            product.marketType = 'secondary';
            // Add secondary market benefits
            product.secondaryBenefits = [
              'Certified pre-owned',
              '30-day play guarantee',
              'Significant savings',
              'Environmental friendly'
            ];
          });
          
          products.push(...retailerProducts);
        } catch (error) {
          console.error(`❌ Error fetching from ${retailer.name}:`, error);
        }
      }
    }

    return products;
  }

  // Search affiliate network for deals
  async searchAffiliateNetwork(analysis, userProfile) {
    const products = [];
    
    for (const [retailerId, retailer] of Object.entries(this.retailers.affiliate)) {
      try {
        const retailerProducts = await this.fetchRetailerProducts(retailerId, analysis);
        
        retailerProducts.forEach(product => {
          product.retailer = {
            id: retailerId,
            name: retailer.name,
            distance: 0,
            preferredPartner: retailer.preferredPartner,
            commission: retailer.commission,
            specialties: retailer.specialties
          };
          product.marketType = 'affiliate';
          // Usually clearance/discount products
          product.dealType = 'clearance';
        });
        
        products.push(...retailerProducts);
      } catch (error) {
        console.error(`❌ Error fetching from ${retailer.name}:`, error);
      }
    }

    return products;
  }

  // Simulate fetching products from retailer APIs
  async fetchRetailerProducts(retailerId, analysis) {
    // In production, this would make actual API calls to retailer systems
    // For now, return mock data based on performance analysis
    
    const mockProducts = this.generateMockProducts(retailerId, analysis);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
    
    return mockProducts;
  }

  // Generate mock products based on performance analysis
  generateMockProducts(retailerId, analysis) {
    const products = [];
    const retailer = this.findRetailerById(retailerId);
    
    // Generate products for each identified need
    analysis.primaryNeeds.forEach(need => {
      const product = this.createProductForNeed(need, retailer, 'primary');
      if (product) products.push(product);
    });

    analysis.secondaryNeeds.forEach(need => {
      const product = this.createProductForNeed(need, retailer, 'secondary');
      if (product) products.push(product);
    });

    return products;
  }

  createProductForNeed(need, retailer, priority) {
    const productDatabase = {
      driver: [
        {
          id: 'tm-stealth2-driver',
          name: 'TaylorMade Stealth 2 Driver',
          brand: 'TaylorMade',
          basePrice: 549.99,
          features: ['Carbon Crown', '60X Carbon Twist Face', 'Adjustable Loft'],
          performanceTargets: { distance: '+20 yards', accuracy: '+15%' }
        },
        {
          id: 'callaway-rogue-driver',
          name: 'Callaway Rogue ST Max Driver',
          brand: 'Callaway',
          basePrice: 499.99,
          features: ['A.I. Face Technology', 'Jailbreak Speed Frame'],
          performanceTargets: { distance: '+18 yards', accuracy: '+12%' }
        }
      ],
      irons: [
        {
          id: 'callaway-rogue-irons',
          name: 'Callaway Rogue ST Max Irons',
          brand: 'Callaway',
          basePrice: 899.99,
          features: ['A.I. Flash Face', 'Tungsten Weighting'],
          performanceTargets: { consistency: '+20%', accuracy: '+15%' }
        }
      ],
      wedges: [
        {
          id: 'vokey-sm9-wedge',
          name: 'Vokey SM9 60° Wedge',
          brand: 'Titleist',
          basePrice: 179.99,
          features: ['Progressive CG', 'Spin Milled Grooves'],
          performanceTargets: { accuracy: '+25%', spin: '+15%' }
        }
      ],
      accessories: [
        {
          id: 'arccos-sensors',
          name: 'Arccos Caddie Smart Sensors',
          brand: 'Arccos',
          basePrice: 199.99,
          features: ['Shot Tracking', 'AI Caddie', 'Analytics'],
          performanceTargets: { improvement: 'Accelerated learning' }
        }
      ]
    };

    const categoryProducts = productDatabase[need.category];
    if (!categoryProducts) return null;

    const baseProduct = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
    
    // Apply retailer-specific pricing and availability
    const product = {
      ...baseProduct,
      price: this.calculateRetailerPrice(baseProduct.basePrice, retailer),
      performanceMatch: Math.floor(need.confidence * 100),
      whyRecommended: this.generateRecommendationReason(need, baseProduct),
      inStock: Math.random() > 0.1, // 90% in stock
      shippingInfo: this.generateShippingInfo(retailer)
    };

    // Add discounts for preferred partners
    if (retailer.preferredPartner) {
      const discount = Math.floor(Math.random() * 20) + 5; // 5-25% discount
      product.originalPrice = product.price;
      product.price = product.price * (1 - discount / 100);
      product.discountPercent = discount;
      product.retailer = { ...product.retailer, discount: discount };
    }

    return product;
  }

  calculateRetailerPrice(basePrice, retailer) {
    // Add retailer-specific markup/discount
    const markup = retailer.preferredPartner ? 0.95 : 1.05; // Preferred partners get better pricing
    return Math.round(basePrice * markup * 100) / 100;
  }

  generateRecommendationReason(need, product) {
    const reasons = {
      distance_deficit: `Your ${need.category} distance is below average. This ${product.name} could add ${product.performanceTargets.distance || '15+ yards'}.`,
      accuracy_problem: `Your accuracy is ${need.issue.includes('accuracy') ? 'below optimal' : 'inconsistent'}. This club could improve accuracy by ${product.performanceTargets.accuracy || '15%'}.`,
      consistency_problem: `Your shot consistency needs improvement. This club offers ${product.performanceTargets.consistency || 'better predictability'}.`,
      short_game_accuracy: `Your short game accuracy could be better. This wedge offers ${product.performanceTargets.accuracy || 'enhanced precision'}.`,
      data_tracking: `Complete shot tracking would accelerate your improvement with detailed analytics.`
    };

    return reasons[need.issue] || `This ${product.name} would enhance your game performance.`;
  }

  generateShippingInfo(retailer) {
    if (retailer.location) {
      return Math.random() > 0.5 ? 'Same-day pickup available' : 'Free shipping + in-store pickup';
    }
    return Math.random() > 0.5 ? 'Free shipping on orders $75+' : '2-3 day delivery';
  }

  // Rank products by relevance to user needs
  rankProductsByRelevance(products, analysis, userProfile) {
    return products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Performance match score (0-100)
      scoreA += a.performanceMatch || 50;
      scoreB += b.performanceMatch || 50;

      // Preferred retailer bonus
      if (a.retailer?.preferredPartner) scoreA += 20;
      if (b.retailer?.preferredPartner) scoreB += 20;

      // Distance penalty (for physical stores)
      if (a.retailer?.distance > 0) scoreA -= Math.min(a.retailer.distance / 2, 10);
      if (b.retailer?.distance > 0) scoreB -= Math.min(b.retailer.distance / 2, 10);

      // Budget alignment
      const userBudgetRange = this.getBudgetRange(userProfile.budget);
      if (a.price >= userBudgetRange.min && a.price <= userBudgetRange.max) scoreA += 15;
      if (b.price >= userBudgetRange.min && b.price <= userBudgetRange.max) scoreB += 15;

      // Brand preference
      if (userProfile.preferredBrands?.includes(a.brand)) scoreA += 10;
      if (userProfile.preferredBrands?.includes(b.brand)) scoreB += 10;

      // Discount bonus
      if (a.discountPercent) scoreA += a.discountPercent / 2;
      if (b.discountPercent) scoreB += b.discountPercent / 2;

      return scoreB - scoreA;
    });
  }

  // Apply user personalization
  applyPersonalization(products, userProfile) {
    // Apply preferred retailer filter if set
    if (userProfile.preferredRetailer) {
      const preferredProducts = products.filter(p => p.retailer.id === userProfile.preferredRetailer);
      const otherProducts = products.filter(p => p.retailer.id !== userProfile.preferredRetailer);
      return [...preferredProducts, ...otherProducts].slice(0, 20);
    }

    // Apply location-based filtering
    let filteredProducts = products;
    if (userProfile.location) {
      filteredProducts = products.filter(p => {
        // Include online retailers
        if (!p.retailer.distance || p.retailer.distance === 0) return true;
        // Include retailers within reasonable distance
        return p.retailer.distance <= (userProfile.maxDistance || 25);
      });
    }

    return filteredProducts.slice(0, 20); // Return top 20
  }

  // Helper methods
  findRetailerById(retailerId) {
    for (const category of Object.values(this.retailers)) {
      if (category[retailerId]) return category[retailerId];
    }
    return null;
  }

  calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2) return 0;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getAverageDriverDistance(skillLevel) {
    const averages = {
      'beginner': 200,
      'intermediate': 250,
      'advanced': 280,
      'pro': 300
    };
    return averages[skillLevel] || 250;
  }

  getBudgetRange(budget) {
    const ranges = {
      'budget': { min: 0, max: 300 },
      'mid-range': { min: 200, max: 800 },
      'premium': { min: 500, max: 2000 },
      'no-limit': { min: 0, max: 10000 }
    };
    return ranges[budget] || ranges['mid-range'];
  }

  determineBudgetRange(userProfile) {
    // AI logic to determine budget based on user behavior
    if (userProfile.totalSpent > 2000) return 'premium';
    if (userProfile.totalSpent > 500) return 'mid-range';
    return 'budget';
  }

  // Category-specific recommendation logic
  getDriverRecommendations(shotData, userProfile) {
    // Driver-specific AI logic
    return {
      priorityFactors: ['distance', 'accuracy', 'forgiveness'],
      recommendations: ['larger sweet spot', 'adjustable loft', 'lighter shaft']
    };
  }

  getIronRecommendations(shotData, userProfile) {
    // Iron-specific AI logic
    return {
      priorityFactors: ['consistency', 'distance_gaps', 'forgiveness'],
      recommendations: ['cavity back design', 'perimeter weighting', 'progressive set']
    };
  }

  getWedgeRecommendations(shotData, userProfile) {
    // Wedge-specific AI logic
    return {
      priorityFactors: ['spin', 'trajectory_control', 'versatility'],
      recommendations: ['multiple bounce options', 'groove optimization', 'gap coverage']
    };
  }

  getPutterRecommendations(shotData, userProfile) {
    // Putter-specific AI logic
    return {
      priorityFactors: ['alignment', 'feel', 'consistency'],
      recommendations: ['alignment aids', 'insert technology', 'head weight options']
    };
  }

  // Fallback recommendations if AI fails
  getFallbackRecommendations(shotData, userProfile) {
    return {
      products: [
        {
          id: 'fallback-driver',
          name: 'TaylorMade Stealth 2 Driver',
          brand: 'TaylorMade',
          price: 449.99,
          performanceMatch: 75,
          whyRecommended: 'Popular choice for improving distance and accuracy',
          retailer: {
            name: 'Golf World Pro Shop',
            distance: 5,
            preferredPartner: true
          }
        }
      ],
      source: 'fallback'
    };
  }

  // Analytics and tracking
  async trackRecommendationEvent(eventType, productId, userId, metadata = {}) {
    try {
      await axios.post('/api/analytics/recommendation-event', {
        event_type: eventType,
        product_id: productId,
        user_id: userId,
        timestamp: new Date(),
        metadata
      });
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
    }
  }
}

module.exports = new MarketplaceAI();