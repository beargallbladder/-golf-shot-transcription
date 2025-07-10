const { faker } = require('@faker-js/faker');

/**
 * Test Data Factory for GolfSimple
 * Provides consistent, realistic test data for all testing scenarios
 */

class TestDataFactory {
  constructor() {
    this.golfClubs = [
      'driver', '3-wood', '5-wood', '7-wood',
      '2-iron', '3-iron', '4-iron', '5-iron', '6-iron', '7-iron', '8-iron', '9-iron',
      'pitching-wedge', 'gap-wedge', 'sand-wedge', '60-degree',
      'putter'
    ];

    this.golfBrands = [
      'TaylorMade', 'Callaway', 'Titleist', 'Ping', 'Mizuno', 'Wilson',
      'Cobra', 'Cleveland', 'Srixon', 'Bridgestone', 'Honma', 'PXG'
    ];

    this.skillLevels = ['beginner', 'intermediate', 'advanced', 'pro'];
    this.budgetRanges = ['budget', 'mid-range', 'premium', 'no-limit'];

    this.retailers = [
      {
        id: 'golf-world-main',
        name: 'Golf World Pro Shop',
        type: 'physical',
        preferredPartner: true,
        discountLevel: 15
      },
      {
        id: 'pga-tour-superstore',
        name: 'PGA Tour Superstore',
        type: 'physical',
        preferredPartner: false,
        discountLevel: 8
      },
      {
        id: 'global-golf',
        name: 'Global Golf',
        type: 'online',
        preferredPartner: true,
        discountLevel: 12
      },
      {
        id: 'rock-bottom-golf',
        name: 'Rock Bottom Golf',
        type: 'online',
        preferredPartner: false,
        discountLevel: 25
      }
    ];

    this.cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
      { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
      { name: 'San Diego', lat: 32.7157, lng: -117.1611 }
    ];
  }

  // User-related test data
  createUser(overrides = {}) {
    const city = faker.helpers.arrayElement(this.cities);
    const skillLevel = faker.helpers.arrayElement(this.skillLevels);
    
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      skillLevel: skillLevel,
      handicap: this.generateHandicap(skillLevel),
      preferredBrands: faker.helpers.arrayElements(this.golfBrands, { min: 1, max: 3 }),
      budget: faker.helpers.arrayElement(this.budgetRanges),
      location: {
        lat: city.lat + (Math.random() - 0.5) * 0.1, // Add slight variation
        lng: city.lng + (Math.random() - 0.5) * 0.1
      },
      city: city.name,
      joinedDate: faker.date.past({ years: 2 }),
      totalShots: faker.number.int({ min: 10, max: 1000 }),
      totalSpent: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
      preferredRetailer: faker.helpers.maybe(() => faker.helpers.arrayElement(this.retailers).id, { probability: 0.7 }),
      hasTrackingDevice: faker.datatype.boolean({ probability: 0.3 }),
      isNewCustomer: faker.datatype.boolean({ probability: 0.2 }),
      lifetimeValue: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
      maxTravelDistance: faker.number.int({ min: 10, max: 50 }),
      ...overrides
    };
  }

  createUserProfile(overrides = {}) {
    const user = this.createUser(overrides);
    return {
      ...user,
      preferences: {
        emailNotifications: faker.datatype.boolean({ probability: 0.8 }),
        smsNotifications: faker.datatype.boolean({ probability: 0.4 }),
        shareData: faker.datatype.boolean({ probability: 0.6 }),
        publicProfile: faker.datatype.boolean({ probability: 0.7 }),
        includeUsed: faker.datatype.boolean({ probability: 0.5 })
      },
      stats: {
        averageDistance: this.generateAverageDistance(user.skillLevel),
        averageAccuracy: this.generateAverageAccuracy(user.skillLevel),
        averageConsistency: this.generateAverageConsistency(user.skillLevel),
        roundsPlayed: faker.number.int({ min: 0, max: 100 }),
        bestRound: faker.number.int({ min: 65, max: 120 })
      }
    };
  }

  // Shot data generation
  createShotData(overrides = {}) {
    const club = faker.helpers.arrayElement(this.golfClubs);
    const distance = this.generateDistance(club);
    const accuracy = faker.number.int({ min: 60, max: 95 });
    const consistency = faker.number.int({ min: 65, max: 90 });

    return {
      id: faker.string.uuid(),
      club: club,
      distance: distance,
      accuracy: accuracy,
      consistency: consistency,
      ballSpeed: this.generateBallSpeed(club, distance),
      launchAngle: this.generateLaunchAngle(club),
      spinRate: this.generateSpinRate(club),
      conditions: this.createWeatherConditions(),
      location: faker.helpers.arrayElement(this.cities),
      timestamp: faker.date.recent({ days: 30 }),
      issues: this.generatePerformanceIssues(distance, accuracy, consistency, club),
      imageUrl: faker.image.url({ width: 800, height: 600 }),
      videoUrl: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
      isPublic: faker.datatype.boolean({ probability: 0.8 }),
      ...overrides
    };
  }

  createMultipleShotData(count = 10, userProfile = null) {
    return Array.from({ length: count }, (_, index) => {
      const baseShot = this.createShotData();
      
      // If user profile provided, bias shots toward their skill level
      if (userProfile) {
        const skillAdjustment = this.getSkillAdjustment(userProfile.skillLevel);
        baseShot.distance = Math.round(baseShot.distance * skillAdjustment.distance);
        baseShot.accuracy = Math.min(95, Math.round(baseShot.accuracy * skillAdjustment.accuracy));
        baseShot.consistency = Math.min(90, Math.round(baseShot.consistency * skillAdjustment.consistency));
      }
      
      return baseShot;
    });
  }

  // Product data generation
  createProduct(overrides = {}) {
    const brand = faker.helpers.arrayElement(this.golfBrands);
    const category = faker.helpers.arrayElement(['driver', 'irons', 'wedges', 'putters', 'accessories', 'apparel']);
    const basePrice = this.generateBasePrice(category);
    const hasDiscount = faker.datatype.boolean({ probability: 0.4 });
    const discountPercent = hasDiscount ? faker.number.int({ min: 5, max: 30 }) : 0;
    const finalPrice = hasDiscount ? basePrice * (1 - discountPercent / 100) : basePrice;

    return {
      id: faker.string.uuid(),
      name: this.generateProductName(brand, category),
      brand: brand,
      category: category,
      price: Math.round(finalPrice * 100) / 100,
      originalPrice: hasDiscount ? basePrice : undefined,
      discountPercent: hasDiscount ? discountPercent : undefined,
      image: faker.image.url({ width: 400, height: 300 }),
      marketType: faker.helpers.arrayElement(['primary', 'secondary', 'clearance']),
      performanceMatch: faker.number.int({ min: 70, max: 98 }),
      retailer: faker.helpers.arrayElement(this.retailers),
      features: this.generateProductFeatures(category),
      whyRecommended: this.generateRecommendationReason(category),
      inStock: faker.datatype.boolean({ probability: 0.85 }),
      shippingInfo: this.generateShippingInfo(),
      rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 0, max: 500 }),
      specifications: this.generateProductSpecs(category),
      condition: faker.helpers.arrayElement(['new', 'excellent', 'very-good', 'good']),
      ...overrides
    };
  }

  createProductCatalog(count = 50) {
    return Array.from({ length: count }, () => this.createProduct());
  }

  // Retailer data generation
  createRetailer(overrides = {}) {
    const city = faker.helpers.arrayElement(this.cities);
    const isOnline = faker.datatype.boolean({ probability: 0.3 });

    return {
      id: faker.string.uuid(),
      name: this.generateRetailerName(),
      type: isOnline ? 'online' : 'physical',
      location: isOnline ? null : {
        lat: city.lat + (Math.random() - 0.5) * 0.05,
        lng: city.lng + (Math.random() - 0.5) * 0.05
      },
      address: isOnline ? null : faker.location.streetAddress({ useFullAddress: true }),
      phone: faker.phone.number(),
      website: faker.internet.url(),
      preferredPartner: faker.datatype.boolean({ probability: 0.4 }),
      discountLevel: faker.number.int({ min: 5, max: 20 }),
      specialties: faker.helpers.arrayElements([
        'fitting', 'lessons', 'repair', 'trade-ins', 'premium-brands',
        'budget-friendly', 'wide-selection', 'custom-clubs', 'simulator'
      ], { min: 1, max: 4 }),
      features: faker.helpers.arrayElements([
        'simulator', 'fitting', 'lessons', 'repair', 'trade-ins',
        'online-ordering', 'pickup-in-store', 'driving-range'
      ], { min: 1, max: 5 }),
      commission: faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 3 }),
      rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 10, max: 1000 }),
      ...overrides
    };
  }

  // Weather and conditions
  createWeatherConditions(overrides = {}) {
    const temperature = faker.number.int({ min: 40, max: 95 });
    const windSpeed = faker.number.int({ min: 0, max: 25 });
    
    return {
      temperature: temperature,
      humidity: faker.number.int({ min: 30, max: 90 }),
      pressure: faker.number.float({ min: 29.5, max: 30.5, fractionDigits: 2 }),
      wind: {
        speed: windSpeed,
        direction: faker.helpers.arrayElement(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']),
        gusts: windSpeed > 10 ? windSpeed + faker.number.int({ min: 3, max: 8 }) : windSpeed
      },
      conditions: faker.helpers.arrayElement(['clear', 'partly-cloudy', 'overcast', 'light-rain', 'windy']),
      airDensity: this.calculateAirDensity(temperature, faker.number.int({ min: 30, max: 90 })),
      visibility: faker.number.int({ min: 5, max: 10 }),
      ...overrides
    };
  }

  // API Response mocks
  createApiResponse(data, success = true, metadata = {}) {
    return {
      success: success,
      data: data,
      timestamp: new Date().toISOString(),
      requestId: faker.string.uuid(),
      ...metadata
    };
  }

  createErrorResponse(errorCode = 'UNKNOWN_ERROR', message = 'An error occurred') {
    return {
      success: false,
      error: {
        code: errorCode,
        message: message,
        timestamp: new Date().toISOString(),
        requestId: faker.string.uuid()
      }
    };
  }

  // Recommendation analysis
  createPerformanceAnalysis(shotData, userProfile) {
    const gaps = this.analyzePerformanceGaps(shotData, userProfile);
    
    return {
      shotId: shotData.id,
      userId: userProfile.id,
      primaryNeeds: gaps.primaryNeeds,
      secondaryNeeds: gaps.secondaryNeeds,
      urgencyScore: gaps.urgencyScore,
      improvementPotential: gaps.improvementPotential,
      budgetRange: this.determineBudgetRange(userProfile),
      confidence: faker.number.float({ min: 0.7, max: 0.95, fractionDigits: 2 }),
      analysisDate: new Date().toISOString()
    };
  }

  // Helper methods for realistic data generation
  generateHandicap(skillLevel) {
    const ranges = {
      beginner: { min: 25, max: 36 },
      intermediate: { min: 15, max: 25 },
      advanced: { min: 5, max: 15 },
      pro: { min: 0, max: 5 }
    };
    const range = ranges[skillLevel] || ranges.intermediate;
    return faker.number.int(range);
  }

  generateDistance(club) {
    const ranges = {
      'driver': { min: 200, max: 320 },
      '3-wood': { min: 180, max: 280 },
      '5-wood': { min: 160, max: 240 },
      '3-iron': { min: 160, max: 220 },
      '4-iron': { min: 150, max: 200 },
      '5-iron': { min: 140, max: 185 },
      '6-iron': { min: 130, max: 170 },
      '7-iron': { min: 120, max: 160 },
      '8-iron': { min: 110, max: 145 },
      '9-iron': { min: 100, max: 130 },
      'pitching-wedge': { min: 80, max: 120 },
      'gap-wedge': { min: 70, max: 105 },
      'sand-wedge': { min: 60, max: 90 },
      '60-degree': { min: 50, max: 80 },
      'putter': { min: 3, max: 8 }
    };
    
    const range = ranges[club] || ranges['7-iron'];
    return faker.number.int(range);
  }

  generateBallSpeed(club, distance) {
    // Simplified ball speed calculation based on club and distance
    const multiplier = club === 'driver' ? 1.5 : club.includes('iron') ? 1.3 : 1.1;
    return Math.round(distance * multiplier);
  }

  generateLaunchAngle(club) {
    const ranges = {
      'driver': { min: 8, max: 15 },
      'iron': { min: 15, max: 25 },
      'wedge': { min: 25, max: 50 },
      'putter': { min: 0, max: 3 }
    };
    
    let range = ranges.iron; // default
    if (club === 'driver') range = ranges.driver;
    else if (club.includes('wedge') || club.includes('degree')) range = ranges.wedge;
    else if (club === 'putter') range = ranges.putter;
    
    return faker.number.int(range);
  }

  generateSpinRate(club) {
    const ranges = {
      'driver': { min: 2000, max: 3500 },
      'iron': { min: 4000, max: 7000 },
      'wedge': { min: 7000, max: 12000 },
      'putter': { min: 100, max: 500 }
    };
    
    let range = ranges.iron; // default
    if (club === 'driver') range = ranges.driver;
    else if (club.includes('wedge') || club.includes('degree')) range = ranges.wedge;
    else if (club === 'putter') range = ranges.putter;
    
    return faker.number.int(range);
  }

  generatePerformanceIssues(distance, accuracy, consistency, club) {
    const issues = [];
    
    // Distance issues
    const expectedDistance = this.generateDistance(club);
    if (distance < expectedDistance * 0.85) {
      issues.push('distance_deficit');
    }
    
    // Accuracy issues
    if (accuracy < 75) {
      issues.push('accuracy_inconsistent');
    }
    
    // Consistency issues
    if (consistency < 75) {
      issues.push('consistency_problem');
    }
    
    // Club-specific issues
    if (club.includes('wedge') && accuracy < 80) {
      issues.push('short_game_accuracy');
    }
    
    return issues;
  }

  generateBasePrice(category) {
    const ranges = {
      driver: { min: 300, max: 600 },
      irons: { min: 600, max: 1200 },
      wedges: { min: 120, max: 250 },
      putters: { min: 150, max: 400 },
      accessories: { min: 50, max: 300 },
      apparel: { min: 30, max: 150 }
    };
    
    const range = ranges[category] || ranges.accessories;
    return faker.number.float({ min: range.min, max: range.max, fractionDigits: 2 });
  }

  generateProductName(brand, category) {
    const productLines = {
      TaylorMade: ['Stealth', 'SIM', 'M6', 'Spider', 'Hi-Toe'],
      Callaway: ['Rogue', 'Mavrik', 'Epic', 'Apex', 'Odyssey'],
      Titleist: ['TSR', 'T100', 'Vokey', 'Scotty Cameron', 'Pro V1'],
      Ping: ['G425', 'i210', 'Glide', 'Anser', 'Blueprint']
    };
    
    const lines = productLines[brand] || ['Pro', 'Elite', 'Tour', 'Max', 'Advanced'];
    const line = faker.helpers.arrayElement(lines);
    const model = faker.helpers.arrayElement(['2', '3', 'Plus', 'Max', 'Pro']);
    
    const categoryNames = {
      driver: 'Driver',
      irons: 'Irons',
      wedges: 'Wedge',
      putters: 'Putter',
      accessories: faker.helpers.arrayElement(['Sensors', 'Glove', 'Bag', 'Rangefinder']),
      apparel: faker.helpers.arrayElement(['Polo', 'Pants', 'Shorts', 'Hat'])
    };
    
    return `${brand} ${line} ${model} ${categoryNames[category]}`;
  }

  generateProductFeatures(category) {
    const featuresByCategory = {
      driver: ['Carbon Crown', 'Adjustable Loft', 'Low Spin', 'High MOI', 'Titanium Face'],
      irons: ['Cavity Back', 'Forged', 'Game Improvement', 'Progressive Design', 'Tungsten Weighting'],
      wedges: ['Milled Grooves', 'Multiple Bounces', 'Spin Technology', 'Versatile Sole'],
      putters: ['Face Insert', 'Alignment Aid', 'Counterbalanced', 'Multiple Weights'],
      accessories: ['Bluetooth', 'GPS', 'Waterproof', 'Long Battery', 'Mobile App'],
      apparel: ['Moisture Wicking', 'UV Protection', 'Stretch Fabric', 'Wrinkle Resistant']
    };
    
    const features = featuresByCategory[category] || featuresByCategory.accessories;
    return faker.helpers.arrayElements(features, { min: 2, max: 4 });
  }

  generateRecommendationReason(category) {
    const reasons = {
      driver: 'Your driver distance could improve with modern technology',
      irons: 'These irons would help with consistency and accuracy',
      wedges: 'Better short game control around the greens',
      putters: 'Improved alignment for better putting accuracy',
      accessories: 'Enhanced tracking for faster improvement',
      apparel: 'Professional appearance and comfort on the course'
    };
    
    return reasons[category] || 'This product would enhance your golf performance';
  }

  generateShippingInfo() {
    return faker.helpers.arrayElement([
      'Free shipping on orders $75+',
      'Same-day pickup available',
      '2-3 day delivery',
      'Free shipping + in-store pickup',
      'Express shipping available'
    ]);
  }

  generateProductSpecs(category) {
    if (category === 'driver') {
      return {
        loft: faker.helpers.arrayElement(['9°', '10.5°', '12°']),
        shaft: faker.helpers.arrayElement(['Regular', 'Stiff', 'X-Stiff']),
        handedness: faker.helpers.arrayElement(['Right', 'Left']),
        headSize: faker.helpers.arrayElement(['460cc', '440cc', '420cc'])
      };
    } else if (category === 'irons') {
      return {
        set: faker.helpers.arrayElement(['4-PW', '5-PW', '6-PW', '7-PW']),
        shaft: faker.helpers.arrayElement(['Steel Regular', 'Steel Stiff', 'Graphite Regular']),
        handedness: faker.helpers.arrayElement(['Right', 'Left']),
        loft: 'Progressive'
      };
    }
    
    return {};
  }

  generateRetailerName() {
    const prefixes = ['Golf', 'Pro', 'Elite', 'Premier', 'Championship'];
    const suffixes = ['World', 'Shop', 'Center', 'Store', 'Pro Shop', 'Equipment', 'Golf'];
    
    const prefix = faker.helpers.arrayElement(prefixes);
    const suffix = faker.helpers.arrayElement(suffixes);
    
    return `${prefix} ${suffix}`;
  }

  calculateAirDensity(temperature, humidity) {
    // Simplified air density calculation for golf ball flight
    const tempK = (temperature - 32) * 5/9 + 273.15;
    const pressure = 101325; // Standard atmospheric pressure
    
    // Simplified formula
    return Math.round((pressure / (287 * tempK)) * 1000) / 1000;
  }

  getSkillAdjustment(skillLevel) {
    const adjustments = {
      beginner: { distance: 0.8, accuracy: 0.7, consistency: 0.6 },
      intermediate: { distance: 0.9, accuracy: 0.8, consistency: 0.8 },
      advanced: { distance: 1.0, accuracy: 0.9, consistency: 0.9 },
      pro: { distance: 1.1, accuracy: 0.95, consistency: 0.95 }
    };
    
    return adjustments[skillLevel] || adjustments.intermediate;
  }

  generateAverageDistance(skillLevel) {
    const bases = { beginner: 180, intermediate: 220, advanced: 260, pro: 290 };
    const base = bases[skillLevel] || bases.intermediate;
    return base + faker.number.int({ min: -20, max: 20 });
  }

  generateAverageAccuracy(skillLevel) {
    const bases = { beginner: 65, intermediate: 75, advanced: 85, pro: 92 };
    const base = bases[skillLevel] || bases.intermediate;
    return Math.min(95, base + faker.number.int({ min: -5, max: 5 }));
  }

  generateAverageConsistency(skillLevel) {
    const bases = { beginner: 60, intermediate: 70, advanced: 80, pro: 90 };
    const base = bases[skillLevel] || bases.intermediate;
    return Math.min(95, base + faker.number.int({ min: -5, max: 5 }));
  }

  analyzePerformanceGaps(shotData, userProfile) {
    const primaryNeeds = [];
    const secondaryNeeds = [];
    let urgencyScore = 0;

    // Analyze distance gaps
    const expectedDistance = this.generateAverageDistance(userProfile.skillLevel);
    if (shotData.distance < expectedDistance * 0.85) {
      primaryNeeds.push({
        category: this.getClubCategory(shotData.club),
        issue: 'distance_deficit',
        confidence: 0.85,
        potential_gain: expectedDistance - shotData.distance
      });
      urgencyScore += 0.3;
    }

    // Analyze accuracy issues
    if (shotData.accuracy < 75) {
      primaryNeeds.push({
        category: this.getClubCategory(shotData.club),
        issue: 'accuracy_problem',
        confidence: 0.75,
        potential_gain: '15-25% accuracy improvement'
      });
      urgencyScore += 0.2;
    }

    return {
      primaryNeeds,
      secondaryNeeds,
      urgencyScore: Math.min(urgencyScore, 1.0),
      improvementPotential: this.calculateImprovementPotential(shotData, userProfile)
    };
  }

  getClubCategory(club) {
    if (club === 'driver') return 'driver';
    if (club.includes('iron')) return 'irons';
    if (club.includes('wedge') || club.includes('degree')) return 'wedges';
    if (club === 'putter') return 'putters';
    return 'accessories';
  }

  calculateImprovementPotential(shotData, userProfile) {
    return {
      distance: Math.max(0, this.generateAverageDistance(userProfile.skillLevel) - shotData.distance),
      accuracy: Math.max(0, 85 - shotData.accuracy),
      consistency: Math.max(0, 80 - shotData.consistency)
    };
  }

  determineBudgetRange(userProfile) {
    if (userProfile.totalSpent > 2000) return 'premium';
    if (userProfile.totalSpent > 500) return 'mid-range';
    return 'budget';
  }

  // Batch creation methods
  createTestSuite(options = {}) {
    const {
      userCount = 10,
      shotCount = 50,
      productCount = 30,
      retailerCount = 8
    } = options;

    return {
      users: Array.from({ length: userCount }, () => this.createUserProfile()),
      shots: Array.from({ length: shotCount }, () => this.createShotData()),
      products: Array.from({ length: productCount }, () => this.createProduct()),
      retailers: Array.from({ length: retailerCount }, () => this.createRetailer()),
      weatherConditions: Array.from({ length: 10 }, () => this.createWeatherConditions())
    };
  }

  // Cleanup and reset
  reset() {
    faker.seed(); // Reset faker seed for new random data
  }

  // Get specific test scenarios
  getTestScenarios() {
    return {
      newBeginner: this.createUserProfile({
        skillLevel: 'beginner',
        totalShots: 5,
        totalSpent: 0,
        isNewCustomer: true
      }),
      
      experiencedPlayer: this.createUserProfile({
        skillLevel: 'advanced',
        totalShots: 500,
        totalSpent: 3000,
        hasTrackingDevice: true
      }),
      
      budgetConsciousPlayer: this.createUserProfile({
        budget: 'budget',
        totalSpent: 200,
        preferences: { includeUsed: true }
      }),
      
      premiumCustomer: this.createUserProfile({
        budget: 'premium',
        totalSpent: 8000,
        preferredBrands: ['Titleist', 'Ping']
      }),
      
      poorDriverPerformance: this.createShotData({
        club: 'driver',
        distance: 180,
        accuracy: 60,
        consistency: 55,
        issues: ['distance_deficit', 'accuracy_inconsistent']
      }),
      
      excellentIronPlay: this.createShotData({
        club: '7-iron',
        distance: 155,
        accuracy: 92,
        consistency: 88,
        issues: []
      })
    };
  }
}

// Export singleton instance
module.exports = new TestDataFactory();