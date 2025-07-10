const axios = require('axios');
const { cache } = require('../config/redis');

class RetailerLocationService {
  constructor() {
    this.retailerDatabase = {
      // Major Golf Retailer Chains
      'golf-world': [
        {
          id: 'golf-world-manhattan',
          name: 'Golf World Pro Shop - Manhattan',
          address: '123 Broadway, New York, NY 10001',
          location: { lat: 40.7128, lng: -74.0060 },
          phone: '(212) 555-GOLF',
          features: ['simulator', 'fitting', 'lessons', 'repair'],
          preferredPartner: true,
          discountLevel: 15,
          specialties: ['premium-brands', 'custom-fitting', 'trade-ins']
        },
        {
          id: 'golf-world-brooklyn',
          name: 'Golf World Pro Shop - Brooklyn',
          address: '456 Flatbush Ave, Brooklyn, NY 11238',
          location: { lat: 40.6782, lng: -73.9442 },
          phone: '(718) 555-GOLF',
          features: ['simulator', 'fitting', 'lessons'],
          preferredPartner: true,
          discountLevel: 15,
          specialties: ['beginner-friendly', 'group-lessons']
        }
      ],
      'pga-tour-superstore': [
        {
          id: 'pga-nyc-times-square',
          name: 'PGA Tour Superstore - Times Square',
          address: '789 7th Ave, New York, NY 10019',
          location: { lat: 40.7589, lng: -73.9851 },
          phone: '(212) 555-PGA1',
          features: ['simulator', 'wide-selection', 'competitive-pricing'],
          preferredPartner: false,
          discountLevel: 8,
          specialties: ['large-inventory', 'competitive-prices']
        }
      ],
      'dicks-sporting': [
        {
          id: 'dicks-midtown',
          name: "Dick's Sporting Goods - Midtown",
          address: '321 5th Ave, New York, NY 10016',
          location: { lat: 40.7505, lng: -73.9934 },
          phone: '(212) 555-DICK',
          features: ['pickup-in-store', 'online-ordering'],
          preferredPartner: false,
          discountLevel: 5,
          specialties: ['mainstream-brands', 'quick-pickup']
        }
      ],
      // Independent Golf Shops
      'local-pro-shops': [
        {
          id: 'central-park-golf',
          name: 'Central Park Golf Center',
          address: '567 Central Park West, New York, NY 10025',
          location: { lat: 40.7831, lng: -73.9712 },
          phone: '(212) 555-PARK',
          features: ['driving-range', 'lessons', 'club-repair'],
          preferredPartner: true,
          discountLevel: 20,
          specialties: ['local-expertise', 'personalized-service', 'lessons']
        },
        {
          id: 'queens-golf-pro',
          name: 'Queens Golf Pro Shop',
          address: '890 Northern Blvd, Queens, NY 11101',
          location: { lat: 40.7505, lng: -73.9642 },
          phone: '(718) 555-QGPS',
          features: ['fitting', 'repair', 'trade-ins'],
          preferredPartner: true,
          discountLevel: 18,
          specialties: ['club-fitting', 'equipment-trade']
        }
      ]
    };

    this.onlineRetailers = {
      'global-golf': {
        id: 'global-golf',
        name: 'Global Golf',
        website: 'https://www.globalgolf.com',
        specialties: ['used-equipment', 'trade-ins', 'certified-pre-owned'],
        preferredPartner: true,
        discountLevel: 12,
        shippingInfo: 'Free shipping on orders $99+',
        returnPolicy: '30-day play guarantee'
      },
      '2nd-swing': {
        id: '2nd-swing',
        name: '2nd Swing Golf',
        website: 'https://www.2ndswing.com',
        specialties: ['premium-used', 'fitting-data', 'warranty'],
        preferredPartner: true,
        discountLevel: 10,
        shippingInfo: 'Free shipping on orders $75+',
        returnPolicy: '90-day warranty'
      },
      'rock-bottom-golf': {
        id: 'rock-bottom-golf',
        name: 'Rock Bottom Golf',
        website: 'https://www.rockbottomgolf.com',
        specialties: ['discount', 'clearance', 'closeouts'],
        preferredPartner: false,
        discountLevel: 25,
        shippingInfo: 'Flat rate shipping $5.99',
        returnPolicy: '60-day return'
      }
    };
  }

  // Find nearest retailers based on user location
  async findNearestRetailers(userLocation, options = {}) {
    const {
      maxDistance = 25, // miles
      maxResults = 10,
      includeOnline = true,
      preferredOnly = false,
      features = []
    } = options;

    try {
      const cacheKey = `retailers:${userLocation.lat}:${userLocation.lng}:${maxDistance}`;
      const cached = await cache.get(cacheKey);
      
      if (cached && !options.forceRefresh) {
        return cached;
      }

      const nearbyRetailers = [];

      // Search physical retailers
      for (const [chain, locations] of Object.entries(this.retailerDatabase)) {
        for (const retailer of locations) {
          const distance = this.calculateDistance(userLocation, retailer.location);
          
          if (distance <= maxDistance) {
            // Filter by preferred status if requested
            if (preferredOnly && !retailer.preferredPartner) continue;
            
            // Filter by required features
            if (features.length > 0 && !features.every(f => retailer.features.includes(f))) continue;
            
            nearbyRetailers.push({
              ...retailer,
              distance: Math.round(distance * 10) / 10, // Round to 1 decimal
              chain: chain,
              type: 'physical'
            });
          }
        }
      }

      // Add online retailers if requested
      if (includeOnline) {
        for (const [id, retailer] of Object.entries(this.onlineRetailers)) {
          if (preferredOnly && !retailer.preferredPartner) continue;
          
          nearbyRetailers.push({
            ...retailer,
            distance: 0,
            type: 'online'
          });
        }
      }

      // Sort by distance, then by preferred status, then by discount level
      const sortedRetailers = nearbyRetailers.sort((a, b) => {
        // Preferred partners first
        if (a.preferredPartner && !b.preferredPartner) return -1;
        if (!a.preferredPartner && b.preferredPartner) return 1;
        
        // Then by distance (online retailers = 0 distance)
        if (a.distance !== b.distance) return a.distance - b.distance;
        
        // Then by discount level
        return b.discountLevel - a.discountLevel;
      });

      const result = {
        retailers: sortedRetailers.slice(0, maxResults),
        userLocation,
        searchRadius: maxDistance,
        totalFound: nearbyRetailers.length
      };

      // Cache for 1 hour
      await cache.set(cacheKey, result, 3600);
      
      return result;

    } catch (error) {
      console.error('❌ Retailer location service error:', error);
      return this.getFallbackRetailers();
    }
  }

  // Set user's preferred retailer
  async setPreferredRetailer(userId, retailerId, reason = 'user_selected') {
    try {
      // In production, this would update the user database
      const preference = {
        userId,
        retailerId,
        setAt: new Date(),
        reason,
        benefits: await this.getRetailerBenefits(retailerId)
      };

      // Cache the preference
      await cache.set(`preferred_retailer:${userId}`, preference, 86400 * 30); // 30 days

      // Track the preference change
      await this.trackPreferenceChange(userId, retailerId, reason);

      return { success: true, preference };
    } catch (error) {
      console.error('❌ Error setting preferred retailer:', error);
      return { success: false, error: error.message };
    }
  }

  // Get retailer benefits and incentives
  async getRetailerBenefits(retailerId) {
    const retailer = this.findRetailerById(retailerId);
    if (!retailer) return null;

    const benefits = {
      discountLevel: retailer.discountLevel,
      specialties: retailer.specialties,
      features: retailer.features || [],
      incentives: []
    };

    // Add dynamic incentives based on retailer type
    if (retailer.preferredPartner) {
      benefits.incentives.push({
        type: 'loyalty_discount',
        description: `${retailer.discountLevel}% off all purchases`,
        value: retailer.discountLevel
      });

      benefits.incentives.push({
        type: 'priority_support',
        description: 'Priority customer service and fitting appointments',
        value: 'premium'
      });
    }

    // Add location-specific benefits
    if (retailer.type === 'physical') {
      benefits.incentives.push({
        type: 'local_pickup',
        description: 'Same-day pickup available',
        value: 'convenience'
      });

      if (retailer.features.includes('simulator')) {
        benefits.incentives.push({
          type: 'simulator_access',
          description: 'Discounted simulator sessions',
          value: '50% off simulator time'
        });
      }
    }

    // Add online-specific benefits
    if (retailer.type === 'online') {
      benefits.incentives.push({
        type: 'free_shipping',
        description: retailer.shippingInfo,
        value: 'free'
      });

      benefits.incentives.push({
        type: 'return_policy',
        description: retailer.returnPolicy,
        value: 'extended'
      });
    }

    return benefits;
  }

  // Generate retailer recommendations based on user needs
  async getRecommendedRetailers(userProfile, shotData, productNeeds) {
    try {
      const nearbyRetailers = await this.findNearestRetailers(userProfile.location, {
        maxDistance: userProfile.maxTravelDistance || 25,
        includeOnline: true
      });

      const recommendations = [];

      for (const retailer of nearbyRetailers.retailers) {
        const recommendation = {
          retailer,
          matchScore: 0,
          reasons: [],
          incentives: await this.getRetailerBenefits(retailer.id)
        };

        // Score based on product needs alignment
        if (productNeeds.includes('fitting') && retailer.features.includes('fitting')) {
          recommendation.matchScore += 25;
          recommendation.reasons.push('Professional club fitting available');
        }

        if (productNeeds.includes('lessons') && retailer.features.includes('lessons')) {
          recommendation.matchScore += 20;
          recommendation.reasons.push('Golf instruction services');
        }

        if (productNeeds.includes('trade-ins') && retailer.specialties.includes('trade-ins')) {
          recommendation.matchScore += 15;
          recommendation.reasons.push('Equipment trade-in program');
        }

        // Bonus for preferred partners
        if (retailer.preferredPartner) {
          recommendation.matchScore += 30;
          recommendation.reasons.push(`${retailer.discountLevel}% GolfSimple member discount`);
        }

        // Distance penalty for physical stores
        if (retailer.type === 'physical') {
          recommendation.matchScore -= Math.min(retailer.distance, 10);
        }

        // Budget alignment
        if (userProfile.budget === 'budget' && retailer.specialties.includes('discount')) {
          recommendation.matchScore += 20;
          recommendation.reasons.push('Budget-friendly pricing');
        }

        if (userProfile.budget === 'premium' && retailer.specialties.includes('premium-brands')) {
          recommendation.matchScore += 15;
          recommendation.reasons.push('Premium equipment selection');
        }

        recommendations.push(recommendation);
      }

      // Sort by match score
      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      return {
        recommendations: recommendations.slice(0, 5),
        userProfile,
        productNeeds
      };

    } catch (error) {
      console.error('❌ Error generating retailer recommendations:', error);
      return { recommendations: [], error: error.message };
    }
  }

  // Track user interactions for retailer optimization
  async trackRetailerInteraction(userId, retailerId, interactionType, metadata = {}) {
    try {
      const interaction = {
        userId,
        retailerId,
        type: interactionType, // 'view', 'click', 'purchase', 'visit'
        timestamp: new Date(),
        metadata
      };

      // Store interaction for analytics
      const interactions = await cache.get(`retailer_interactions:${userId}`) || [];
      interactions.push(interaction);
      
      // Keep last 100 interactions
      if (interactions.length > 100) {
        interactions.splice(0, interactions.length - 100);
      }
      
      await cache.set(`retailer_interactions:${userId}`, interactions, 86400 * 7); // 7 days

      // Update retailer performance metrics
      await this.updateRetailerMetrics(retailerId, interactionType);

    } catch (error) {
      console.error('❌ Error tracking retailer interaction:', error);
    }
  }

  // Dynamic discount system for retailer competition
  async calculateDynamicDiscount(retailerId, productCategory, userProfile) {
    try {
      const baseDiscount = this.findRetailerById(retailerId)?.discountLevel || 0;
      let dynamicDiscount = baseDiscount;

      // Increase discount for new customers
      if (userProfile.isNewCustomer) {
        dynamicDiscount += 5;
      }

      // Increase discount for high-value customers
      if (userProfile.lifetimeValue > 1000) {
        dynamicDiscount += 3;
      }

      // Competitive pricing adjustments
      const competitorPricing = await this.getCompetitorPricing(productCategory, userProfile.location);
      if (competitorPricing.avgDiscount > dynamicDiscount) {
        dynamicDiscount = Math.min(competitorPricing.avgDiscount + 2, baseDiscount + 10);
      }

      // Seasonal adjustments
      const seasonalAdjustment = this.getSeasonalDiscountAdjustment();
      dynamicDiscount += seasonalAdjustment;

      // Cap at maximum discount
      const maxDiscount = this.findRetailerById(retailerId)?.preferredPartner ? 25 : 15;
      dynamicDiscount = Math.min(dynamicDiscount, maxDiscount);

      return {
        baseDiscount,
        dynamicDiscount: Math.round(dynamicDiscount),
        factors: {
          newCustomer: userProfile.isNewCustomer ? 5 : 0,
          highValue: userProfile.lifetimeValue > 1000 ? 3 : 0,
          competitive: competitorPricing.avgDiscount > baseDiscount ? 2 : 0,
          seasonal: seasonalAdjustment
        }
      };

    } catch (error) {
      console.error('❌ Error calculating dynamic discount:', error);
      return { baseDiscount: 0, dynamicDiscount: 0 };
    }
  }

  // Helper methods
  calculateDistance(loc1, loc2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  findRetailerById(retailerId) {
    // Search physical retailers
    for (const locations of Object.values(this.retailerDatabase)) {
      const retailer = locations.find(r => r.id === retailerId);
      if (retailer) return { ...retailer, type: 'physical' };
    }

    // Search online retailers
    const onlineRetailer = this.onlineRetailers[retailerId];
    if (onlineRetailer) return { ...onlineRetailer, type: 'online' };

    return null;
  }

  async getCompetitorPricing(productCategory, location) {
    // Simulate competitor analysis
    return {
      avgDiscount: Math.floor(Math.random() * 15) + 5, // 5-20%
      priceRange: { min: 100, max: 800 },
      topCompetitors: ['Golf Galaxy', 'PGA Tour Superstore', 'Local Pro Shops']
    };
  }

  getSeasonalDiscountAdjustment() {
    const month = new Date().getMonth();
    // Higher discounts in off-season (winter months)
    if (month >= 11 || month <= 2) return 5; // Dec, Jan, Feb
    // Moderate discounts in shoulder seasons
    if (month === 3 || month === 10) return 2; // Mar, Oct
    // No adjustment during peak season
    return 0;
  }

  async updateRetailerMetrics(retailerId, interactionType) {
    const metricsKey = `retailer_metrics:${retailerId}`;
    const metrics = await cache.get(metricsKey) || {
      views: 0,
      clicks: 0,
      purchases: 0,
      visits: 0
    };

    metrics[interactionType] = (metrics[interactionType] || 0) + 1;
    await cache.set(metricsKey, metrics, 86400); // 24 hours
  }

  async trackPreferenceChange(userId, retailerId, reason) {
    console.log(`📍 User ${userId} set preferred retailer to ${retailerId} (${reason})`);
    // In production, this would log to analytics service
  }

  getFallbackRetailers() {
    return {
      retailers: [
        {
          id: 'online-fallback',
          name: 'Golf Equipment Direct',
          type: 'online',
          distance: 0,
          preferredPartner: false,
          discountLevel: 10,
          specialties: ['online-ordering']
        }
      ],
      totalFound: 1,
      error: 'Location service temporarily unavailable'
    };
  }

  // Geocoding service to convert address to coordinates
  async geocodeAddress(address) {
    try {
      // In production, use Google Maps Geocoding API or similar
      // For now, return mock coordinates for major cities
      const cityCoordinates = {
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'houston': { lat: 29.7604, lng: -95.3698 },
        'phoenix': { lat: 33.4484, lng: -112.0740 }
      };

      const lowerAddress = address.toLowerCase();
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (lowerAddress.includes(city)) {
          return coords;
        }
      }

      // Default to NYC if no match
      return cityCoordinates['new york'];
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    }
  }
}

module.exports = new RetailerLocationService();