/**
 * ScoringAgent - Multi-Dimensional Performance Analysis
 * Analyzes shots against personal bests, peers, and professional standards
 */

class ScoringAgent {
  constructor() {
    this.pgatourAverages = {
      'driver': { speed: 167, distance: 296, spin: 2686, launchAngle: 10.9 },
      '7-iron': { speed: 120, distance: 172, spin: 7097, launchAngle: 16.3 },
      'pitching-wedge': { speed: 102, distance: 136, spin: 9304, launchAngle: 24.2 }
    };
    
    this.handicapAverages = {
      'scratch': { driverDistance: 275, accuracy: 85 },
      '5-10': { driverDistance: 250, accuracy: 70 },
      '10-15': { driverDistance: 225, accuracy: 60 },
      '15-20': { driverDistance: 200, accuracy: 50 },
      '20+': { driverDistance: 175, accuracy: 40 }
    };
  }

  async score(normalizedShot, userProfile) {
    try {
      console.log('📊 ScoringAgent: Starting performance analysis');
      
      const scores = await Promise.all([
        this.personalBestComparison(normalizedShot, userProfile),
        this.peerComparison(normalizedShot, userProfile),
        this.proComparison(normalizedShot),
        this.efficiencyScore(normalizedShot),
        this.consistencyScore(normalizedShot, userProfile)
      ]);
      
      const overallScore = this.calculateOverallScore(scores);
      const insights = this.generateInsights(scores, normalizedShot);
      const recommendations = this.generateRecommendations(scores, normalizedShot);
      
      console.log('📊 Performance analysis complete');
      
      return {
        overall: overallScore,
        breakdown: {
          personalBest: scores[0],
          peerComparison: scores[1],
          proComparison: scores[2],
          efficiency: scores[3],
          consistency: scores[4]
        },
        insights: insights,
        recommendations: recommendations,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('📊 ScoringAgent error:', error);
      throw new Error(`Performance scoring failed: ${error.message}`);
    }
  }

  async personalBestComparison(shot, userProfile) {
    console.log('📊 Analyzing personal best comparison');
    
    // Mock personal best data (would come from database)
    const personalBests = userProfile.personalBests || {
      [shot.club]: {
        distance: shot.distance ? shot.distance * 0.9 : 200,
        speed: shot.speed ? shot.speed * 0.95 : 140,
        spin: shot.spin ? shot.spin * 1.1 : 3000
      }
    };
    
    const clubBest = personalBests[shot.club];
    if (!clubBest) {
      return {
        score: 100, // First shot with this club
        isNewBest: true,
        improvements: ['First recorded shot with this club!'],
        confidence: 0.9
      };
    }
    
    const improvements = [];
    let score = 50; // Base score
    
    // Distance comparison
    if (shot.distance && clubBest.distance) {
      const distanceImprovement = ((shot.distance - clubBest.distance) / clubBest.distance) * 100;
      if (distanceImprovement > 0) {
        improvements.push(`Distance improved by ${distanceImprovement.toFixed(1)}%`);
        score += Math.min(distanceImprovement * 2, 20);
      }
    }
    
    // Speed comparison
    if (shot.speed && clubBest.speed) {
      const speedImprovement = ((shot.speed - clubBest.speed) / clubBest.speed) * 100;
      if (speedImprovement > 0) {
        improvements.push(`Ball speed improved by ${speedImprovement.toFixed(1)}%`);
        score += Math.min(speedImprovement * 1.5, 15);
      }
    }
    
    // Spin optimization (closer to optimal is better)
    if (shot.spin && clubBest.spin) {
      const optimalSpin = this.getOptimalSpin(shot.club);
      const currentSpinDiff = Math.abs(shot.spin - optimalSpin);
      const bestSpinDiff = Math.abs(clubBest.spin - optimalSpin);
      
      if (currentSpinDiff < bestSpinDiff) {
        improvements.push('Spin rate more optimal');
        score += 10;
      }
    }
    
    return {
      score: Math.min(Math.max(score, 0), 100),
      isNewBest: improvements.length > 0,
      improvements: improvements,
      confidence: 0.85
    };
  }

  async peerComparison(shot, userProfile) {
    console.log('📊 Analyzing peer comparison');
    
    const handicapGroup = this.getHandicapGroup(userProfile.handicap || 15);
    const peerAverages = this.handicapAverages[handicapGroup];
    
    let score = 50; // Base score
    const comparisons = [];
    
    // Distance comparison for driver
    if (shot.club === 'driver' && shot.distance) {
      const peerDistance = peerAverages.driverDistance;
      const distanceRatio = shot.distance / peerDistance;
      
      if (distanceRatio > 1.1) {
        comparisons.push(`${((distanceRatio - 1) * 100).toFixed(0)}% longer than peer average`);
        score += 25;
      } else if (distanceRatio > 0.95) {
        comparisons.push('Similar to peer average distance');
        score += 10;
      } else {
        comparisons.push(`${((1 - distanceRatio) * 100).toFixed(0)}% shorter than peer average`);
        score -= 10;
      }
    }
    
    // General performance indicators
    if (shot.smashFactor && shot.smashFactor > 1.4) {
      comparisons.push('Excellent contact efficiency');
      score += 15;
    }
    
    if (shot.ballFlight === 'straight') {
      comparisons.push('Good ball flight control');
      score += 10;
    }
    
    return {
      score: Math.min(Math.max(score, 0), 100),
      handicapGroup: handicapGroup,
      comparisons: comparisons,
      confidence: 0.75
    };
  }

  async proComparison(shot) {
    console.log('📊 Analyzing professional comparison');
    
    const proAverage = this.pgatourAverages[shot.club] || this.pgatourAverages['7-iron'];
    let score = 0;
    const comparisons = [];
    
    // Distance comparison
    if (shot.distance && proAverage.distance) {
      const distanceRatio = shot.distance / proAverage.distance;
      score += Math.min(distanceRatio * 40, 40);
      
      if (distanceRatio > 0.9) {
        comparisons.push(`${(distanceRatio * 100).toFixed(0)}% of PGA Tour average distance`);
      } else {
        comparisons.push(`${(distanceRatio * 100).toFixed(0)}% of PGA Tour distance`);
      }
    }
    
    // Speed comparison
    if (shot.speed && proAverage.speed) {
      const speedRatio = shot.speed / proAverage.speed;
      score += Math.min(speedRatio * 30, 30);
      
      comparisons.push(`${(speedRatio * 100).toFixed(0)}% of PGA Tour ball speed`);
    }
    
    // Launch conditions
    if (shot.launchAngle && proAverage.launchAngle) {
      const angleDiff = Math.abs(shot.launchAngle - proAverage.launchAngle);
      if (angleDiff < 3) {
        score += 15;
        comparisons.push('Launch angle similar to Tour average');
      }
    }
    
    // Spin rate
    if (shot.spin && proAverage.spin) {
      const spinDiff = Math.abs(shot.spin - proAverage.spin) / proAverage.spin;
      if (spinDiff < 0.2) {
        score += 15;
        comparisons.push('Spin rate in Tour range');
      }
    }
    
    return {
      score: Math.min(Math.max(score, 0), 100),
      comparisons: comparisons,
      tourAverage: proAverage,
      confidence: 0.8
    };
  }

  async efficiencyScore(shot) {
    console.log('📊 Calculating efficiency score');
    
    let score = 50;
    const factors = [];
    
    // Smash factor (ball speed / club speed)
    if (shot.smashFactor) {
      if (shot.smashFactor > 1.45) {
        score += 25;
        factors.push('Excellent contact efficiency');
      } else if (shot.smashFactor > 1.35) {
        score += 15;
        factors.push('Good contact efficiency');
      } else {
        score -= 10;
        factors.push('Room for improvement in contact');
      }
    }
    
    // Launch conditions optimization
    if (shot.launchAngle && shot.spin) {
      const isOptimal = this.isOptimalLaunch(shot.club, shot.launchAngle, shot.spin);
      if (isOptimal) {
        score += 20;
        factors.push('Optimal launch conditions');
      }
    }
    
    // Ball flight consistency
    if (shot.ballFlight === 'straight') {
      score += 10;
      factors.push('Consistent ball flight');
    }
    
    return {
      score: Math.min(Math.max(score, 0), 100),
      factors: factors,
      confidence: 0.8
    };
  }

  async consistencyScore(shot, userProfile) {
    console.log('📊 Calculating consistency score');
    
    // Mock recent shots data (would come from database)
    const recentShots = userProfile.recentShots || [];
    
    if (recentShots.length < 3) {
      return {
        score: 50,
        factors: ['Not enough data for consistency analysis'],
        confidence: 0.3
      };
    }
    
    const clubShots = recentShots.filter(s => s.club === shot.club);
    if (clubShots.length < 2) {
      return {
        score: 50,
        factors: ['Not enough shots with this club'],
        confidence: 0.4
      };
    }
    
    // Calculate variance in key metrics
    const distanceVariance = this.calculateVariance(clubShots.map(s => s.distance));
    const speedVariance = this.calculateVariance(clubShots.map(s => s.speed));
    
    let score = 50;
    const factors = [];
    
    // Lower variance = higher consistency
    if (distanceVariance < 10) {
      score += 25;
      factors.push('Very consistent distance');
    } else if (distanceVariance < 20) {
      score += 10;
      factors.push('Good distance consistency');
    }
    
    if (speedVariance < 5) {
      score += 25;
      factors.push('Very consistent ball speed');
    } else if (speedVariance < 10) {
      score += 10;
      factors.push('Good ball speed consistency');
    }
    
    return {
      score: Math.min(Math.max(score, 0), 100),
      factors: factors,
      variance: { distance: distanceVariance, speed: speedVariance },
      confidence: 0.7
    };
  }

  calculateOverallScore(scores) {
    const weights = {
      personalBest: 0.3,
      peerComparison: 0.2,
      proComparison: 0.2,
      efficiency: 0.2,
      consistency: 0.1
    };
    
    const weightedScore = 
      (scores[0].score * weights.personalBest) +
      (scores[1].score * weights.peerComparison) +
      (scores[2].score * weights.proComparison) +
      (scores[3].score * weights.efficiency) +
      (scores[4].score * weights.consistency);
    
    return {
      score: Math.round(weightedScore),
      grade: this.getGrade(weightedScore),
      confidence: 0.8
    };
  }

  generateInsights(scores, shot) {
    const insights = [];
    
    // Personal best insights
    if (scores[0].isNewBest) {
      insights.push('🎉 New personal best with this club!');
    }
    
    // Efficiency insights
    if (scores[3].score > 80) {
      insights.push('💪 Excellent contact and efficiency');
    } else if (scores[3].score < 40) {
      insights.push('🎯 Focus on contact quality for better results');
    }
    
    // Professional comparison insights
    if (scores[2].score > 70) {
      insights.push('🏆 Tour-level performance on this shot');
    }
    
    // Consistency insights
    if (scores[4].score > 80) {
      insights.push('📈 Very consistent performance');
    } else if (scores[4].score < 40) {
      insights.push('🎲 Work on consistency for lower scores');
    }
    
    return insights;
  }

  generateRecommendations(scores, shot) {
    const recommendations = [];
    
    // Efficiency recommendations
    if (shot.smashFactor && shot.smashFactor < 1.3) {
      recommendations.push('Focus on center contact for better ball speed');
    }
    
    // Launch angle recommendations
    if (shot.launchAngle && shot.launchAngle < 8) {
      recommendations.push('Try to launch the ball higher for more carry distance');
    }
    
    // Spin recommendations
    if (shot.spin && shot.spin > 4000) {
      recommendations.push('Reduce spin rate for more distance');
    }
    
    // Ball flight recommendations
    if (shot.ballFlight !== 'straight') {
      recommendations.push('Work on ball flight control for more consistency');
    }
    
    return recommendations;
  }

  // Helper methods
  getHandicapGroup(handicap) {
    if (handicap <= 0) return 'scratch';
    if (handicap <= 10) return '5-10';
    if (handicap <= 15) return '10-15';
    if (handicap <= 20) return '15-20';
    return '20+';
  }

  getOptimalSpin(club) {
    const optimalSpins = {
      'driver': 2600,
      '7-iron': 7000,
      'pitching-wedge': 9000
    };
    return optimalSpins[club] || 5000;
  }

  isOptimalLaunch(club, launchAngle, spin) {
    const optimal = {
      'driver': { minAngle: 9, maxAngle: 13, minSpin: 2200, maxSpin: 3000 },
      '7-iron': { minAngle: 14, maxAngle: 18, minSpin: 6500, maxSpin: 7500 }
    };
    
    const clubOptimal = optimal[club];
    if (!clubOptimal) return false;
    
    return launchAngle >= clubOptimal.minAngle && 
           launchAngle <= clubOptimal.maxAngle &&
           spin >= clubOptimal.minSpin && 
           spin <= clubOptimal.maxSpin;
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance); // Return standard deviation
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  }

  async healthCheck() {
    return {
      status: 'healthy',
      pgatourData: Object.keys(this.pgatourAverages).length,
      handicapGroups: Object.keys(this.handicapAverages).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ScoringAgent; 