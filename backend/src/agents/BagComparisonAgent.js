/**
 * BagComparisonAgent - AI-Powered Equipment Optimization
 * Analyzes golf bag performance and provides equipment recommendations
 */

class BagComparisonAgent {
  constructor() {
    this.equipmentDatabase = {
      drivers: [
        { brand: 'TaylorMade', model: 'Stealth 2', loft: 10.5, category: 'game-improvement' },
        { brand: 'Callaway', model: 'Paradym', loft: 9, category: 'tour-level' },
        { brand: 'Titleist', model: 'TSR3', loft: 9.5, category: 'tour-level' }
      ],
      irons: [
        { brand: 'Ping', model: 'G430', category: 'game-improvement' },
        { brand: 'TaylorMade', model: 'P790', category: 'players-distance' },
        { brand: 'Titleist', model: 'T100', category: 'tour-level' }
      ]
    };
    
    this.gappingStandards = {
      'driver': { distance: 250, gapToNext: 30 },
      '3-wood': { distance: 220, gapToNext: 25 },
      '5-wood': { distance: 195, gapToNext: 20 },
      '4-iron': { distance: 175, gapToNext: 15 },
      '5-iron': { distance: 160, gapToNext: 12 },
      '6-iron': { distance: 148, gapToNext: 12 },
      '7-iron': { distance: 136, gapToNext: 12 },
      '8-iron': { distance: 124, gapToNext: 12 },
      '9-iron': { distance: 112, gapToNext: 12 },
      'pitching-wedge': { distance: 100, gapToNext: 15 },
      'sand-wedge': { distance: 85, gapToNext: 20 },
      'lob-wedge': { distance: 65, gapToNext: 0 }
    };
  }

  async analyzeBag(userShots, userProfile) {
    try {
      console.log('🎒 BagComparisonAgent: Starting bag analysis');
      
      const bagData = this.organizeShotsByClub(userShots);
      
      const analysis = {
        gapping: await this.analyzeClubGapping(bagData),
        efficiency: await this.calculateClubEfficiency(bagData),
        recommendations: await this.getEquipmentRecommendations(bagData, userProfile),
        proComparisons: await this.compareToPros(bagData),
        fittingInsights: await this.generateFittingInsights(bagData, userProfile),
        missingClubs: this.identifyMissingClubs(bagData),
        strengths: this.identifyStrengths(bagData),
        weaknesses: this.identifyWeaknesses(bagData)
      };
      
      const actionableSteps = this.prioritizeRecommendations(analysis);
      const estimatedImprovement = this.calculatePotentialGains(analysis);
      
      console.log('🎒 Bag analysis complete');
      
      return {
        ...analysis,
        actionableSteps: actionableSteps,
        estimatedImprovement: estimatedImprovement,
        confidence: 0.8,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('🎒 BagComparisonAgent error:', error);
      throw new Error(`Bag analysis failed: ${error.message}`);
    }
  }

  organizeShotsByClub(shots) {
    const bagData = {};
    
    shots.forEach(shot => {
      if (!bagData[shot.club]) {
        bagData[shot.club] = [];
      }
      bagData[shot.club].push(shot);
    });
    
    // Calculate averages for each club
    Object.keys(bagData).forEach(club => {
      const clubShots = bagData[club];
      bagData[club] = {
        shots: clubShots,
        averages: {
          distance: this.calculateAverage(clubShots, 'distance'),
          speed: this.calculateAverage(clubShots, 'speed'),
          spin: this.calculateAverage(clubShots, 'spin'),
          launchAngle: this.calculateAverage(clubShots, 'launchAngle'),
          smashFactor: this.calculateAverage(clubShots, 'smashFactor')
        },
        consistency: {
          distanceStdDev: this.calculateStdDev(clubShots, 'distance'),
          speedStdDev: this.calculateStdDev(clubShots, 'speed')
        },
        shotCount: clubShots.length,
        bestShot: this.findBestShot(clubShots)
      };
    });
    
    return bagData;
  }

  async analyzeClubGapping(bagData) {
    console.log('🎒 Analyzing club gapping');
    
    const clubs = Object.keys(bagData).sort(this.sortClubsByDistance);
    const gappingAnalysis = {
      gaps: [],
      overlaps: [],
      recommendations: [],
      score: 0
    };
    
    for (let i = 0; i < clubs.length - 1; i++) {
      const currentClub = clubs[i];
      const nextClub = clubs[i + 1];
      
      const currentDistance = bagData[currentClub].averages.distance;
      const nextDistance = bagData[nextClub].averages.distance;
      
      if (!currentDistance || !nextDistance) continue;
      
      const gap = currentDistance - nextDistance;
      const idealGap = this.getIdealGap(currentClub, nextClub);
      
      if (gap > idealGap + 10) {
        gappingAnalysis.gaps.push({
          between: [currentClub, nextClub],
          actualGap: gap,
          idealGap: idealGap,
          severity: 'high'
        });
      } else if (gap < idealGap - 5) {
        gappingAnalysis.overlaps.push({
          between: [currentClub, nextClub],
          actualGap: gap,
          idealGap: idealGap,
          severity: 'medium'
        });
      }
    }
    
    // Generate recommendations
    if (gappingAnalysis.gaps.length > 0) {
      gappingAnalysis.recommendations.push('Consider adding hybrid or utility iron to fill distance gaps');
    }
    
    if (gappingAnalysis.overlaps.length > 0) {
      gappingAnalysis.recommendations.push('Some clubs have overlapping distances - consider adjusting lofts');
    }
    
    // Calculate gapping score
    const totalIssues = gappingAnalysis.gaps.length + gappingAnalysis.overlaps.length;
    gappingAnalysis.score = Math.max(0, 100 - (totalIssues * 15));
    
    return gappingAnalysis;
  }

  async calculateClubEfficiency(bagData) {
    console.log('🎒 Calculating club efficiency');
    
    const efficiencyAnalysis = {};
    
    Object.keys(bagData).forEach(club => {
      const clubData = bagData[club];
      const averages = clubData.averages;
      
      let efficiencyScore = 50; // Base score
      const factors = [];
      
      // Smash factor efficiency
      if (averages.smashFactor) {
        if (averages.smashFactor > 1.4) {
          efficiencyScore += 20;
          factors.push('Excellent contact efficiency');
        } else if (averages.smashFactor > 1.3) {
          efficiencyScore += 10;
          factors.push('Good contact efficiency');
        } else {
          efficiencyScore -= 10;
          factors.push('Poor contact efficiency');
        }
      }
      
      // Consistency factor
      if (clubData.consistency.distanceStdDev < 10) {
        efficiencyScore += 15;
        factors.push('Very consistent distance');
      } else if (clubData.consistency.distanceStdDev < 20) {
        efficiencyScore += 5;
        factors.push('Moderately consistent');
      } else {
        efficiencyScore -= 10;
        factors.push('Inconsistent distance');
      }
      
      // Distance optimization
      const expectedDistance = this.gappingStandards[club]?.distance;
      if (expectedDistance && averages.distance) {
        const distanceRatio = averages.distance / expectedDistance;
        if (distanceRatio > 0.9 && distanceRatio < 1.1) {
          efficiencyScore += 10;
          factors.push('Optimal distance for club');
        }
      }
      
      efficiencyAnalysis[club] = {
        score: Math.min(Math.max(efficiencyScore, 0), 100),
        factors: factors,
        grade: this.getGrade(efficiencyScore)
      };
    });
    
    return efficiencyAnalysis;
  }

  async getEquipmentRecommendations(bagData, userProfile) {
    console.log('🎒 Generating equipment recommendations');
    
    const recommendations = [];
    const handicap = userProfile.handicap || 15;
    const skillLevel = this.getSkillLevel(handicap);
    
    Object.keys(bagData).forEach(club => {
      const clubData = bagData[club];
      const efficiency = clubData.averages.smashFactor || 1.2;
      const consistency = clubData.consistency.distanceStdDev || 20;
      
      // Poor efficiency recommendations
      if (efficiency < 1.3) {
        recommendations.push({
          club: club,
          type: 'equipment_change',
          priority: 'high',
          recommendation: `Consider more forgiving ${club} for better contact`,
          reason: `Current smash factor: ${efficiency.toFixed(2)}`,
          suggestedEquipment: this.getSuggestedEquipment(club, skillLevel, 'forgiveness')
        });
      }
      
      // Consistency recommendations
      if (consistency > 25) {
        recommendations.push({
          club: club,
          type: 'fitting_session',
          priority: 'medium',
          recommendation: `Professional fitting recommended for ${club}`,
          reason: `High distance variance: ${consistency.toFixed(1)} yards`,
          suggestedAction: 'shaft_fitting'
        });
      }
      
      // Distance optimization
      const expectedDistance = this.gappingStandards[club]?.distance;
      if (expectedDistance && clubData.averages.distance) {
        const distanceRatio = clubData.averages.distance / expectedDistance;
        if (distanceRatio < 0.8) {
          recommendations.push({
            club: club,
            type: 'technique_or_equipment',
            priority: 'medium',
            recommendation: `${club} distance below average - consider stronger loft or technique work`,
            reason: `Current: ${clubData.averages.distance}y, Expected: ${expectedDistance}y`,
            suggestedAction: 'distance_optimization'
          });
        }
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async compareToPros(bagData) {
    console.log('🎒 Comparing to professional standards');
    
    const proStandards = {
      'driver': { distance: 296, speed: 167, spin: 2686, launchAngle: 10.9 },
      '7-iron': { distance: 172, speed: 120, spin: 7097, launchAngle: 16.3 },
      'pitching-wedge': { distance: 136, speed: 102, spin: 9304, launchAngle: 24.2 }
    };
    
    const comparisons = {};
    
    Object.keys(bagData).forEach(club => {
      const proStandard = proStandards[club];
      if (!proStandard) return;
      
      const userAverages = bagData[club].averages;
      const comparison = {};
      
      ['distance', 'speed', 'spin', 'launchAngle'].forEach(metric => {
        if (userAverages[metric] && proStandard[metric]) {
          const ratio = userAverages[metric] / proStandard[metric];
          comparison[metric] = {
            user: userAverages[metric],
            pro: proStandard[metric],
            ratio: ratio,
            percentage: Math.round(ratio * 100),
            grade: this.getComparisonGrade(ratio)
          };
        }
      });
      
      comparisons[club] = comparison;
    });
    
    return comparisons;
  }

  async generateFittingInsights(bagData, userProfile) {
    console.log('🎒 Generating fitting insights');
    
    const insights = [];
    const handicap = userProfile.handicap || 15;
    
    // Analyze swing speed patterns
    const speeds = Object.values(bagData)
      .map(club => club.averages.speed)
      .filter(speed => speed);
    
    if (speeds.length > 0) {
      const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
      
      if (avgSpeed > 110) {
        insights.push({
          category: 'shaft_fitting',
          insight: 'High swing speed - consider stiffer shaft flex',
          recommendation: 'X-flex or stiff shaft recommended',
          priority: 'high'
        });
      } else if (avgSpeed < 85) {
        insights.push({
          category: 'shaft_fitting',
          insight: 'Moderate swing speed - regular flex appropriate',
          recommendation: 'Regular or senior flex recommended',
          priority: 'medium'
        });
      }
    }
    
    // Analyze launch conditions
    Object.keys(bagData).forEach(club => {
      const launchAngle = bagData[club].averages.launchAngle;
      const spin = bagData[club].averages.spin;
      
      if (club === 'driver' && launchAngle && spin) {
        if (launchAngle < 8 || spin > 3500) {
          insights.push({
            category: 'driver_optimization',
            insight: 'Driver launch conditions not optimal',
            recommendation: 'Consider higher loft or shaft change',
            priority: 'high'
          });
        }
      }
    });
    
    // Handicap-based recommendations
    if (handicap > 15) {
      insights.push({
        category: 'game_improvement',
        insight: 'Game improvement equipment recommended',
        recommendation: 'Focus on forgiving, perimeter-weighted clubs',
        priority: 'high'
      });
    } else if (handicap < 5) {
      insights.push({
        category: 'tour_level',
        insight: 'Tour-level equipment appropriate',
        recommendation: 'Consider blade irons and tour-level driver',
        priority: 'medium'
      });
    }
    
    return insights;
  }

  identifyMissingClubs(bagData) {
    const standardBag = ['driver', '3-wood', '5-iron', '6-iron', '7-iron', '8-iron', '9-iron', 'pitching-wedge', 'sand-wedge'];
    const userClubs = Object.keys(bagData);
    
    return standardBag.filter(club => !userClubs.includes(club));
  }

  identifyStrengths(bagData) {
    const strengths = [];
    
    Object.keys(bagData).forEach(club => {
      const clubData = bagData[club];
      
      if (clubData.averages.smashFactor > 1.4) {
        strengths.push(`Excellent contact with ${club}`);
      }
      
      if (clubData.consistency.distanceStdDev < 10) {
        strengths.push(`Very consistent ${club} distances`);
      }
    });
    
    return strengths;
  }

  identifyWeaknesses(bagData) {
    const weaknesses = [];
    
    Object.keys(bagData).forEach(club => {
      const clubData = bagData[club];
      
      if (clubData.averages.smashFactor < 1.25) {
        weaknesses.push(`Poor contact efficiency with ${club}`);
      }
      
      if (clubData.consistency.distanceStdDev > 25) {
        weaknesses.push(`Inconsistent ${club} distances`);
      }
    });
    
    return weaknesses;
  }

  prioritizeRecommendations(analysis) {
    const actions = [];
    
    // High priority equipment changes
    const highPriorityRecs = analysis.recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      actions.push({
        priority: 1,
        action: 'Address equipment inefficiencies',
        details: highPriorityRecs.map(r => r.recommendation)
      });
    }
    
    // Gapping issues
    if (analysis.gapping.gaps.length > 0) {
      actions.push({
        priority: 2,
        action: 'Fix distance gapping',
        details: ['Add hybrid or utility iron', 'Consider loft adjustments']
      });
    }
    
    // Fitting sessions
    const fittingRecs = analysis.recommendations.filter(r => r.type === 'fitting_session');
    if (fittingRecs.length > 0) {
      actions.push({
        priority: 3,
        action: 'Schedule professional fitting',
        details: fittingRecs.map(r => r.club)
      });
    }
    
    return actions.sort((a, b) => a.priority - b.priority);
  }

  calculatePotentialGains(analysis) {
    let estimatedDistanceGain = 0;
    let estimatedAccuracyGain = 0;
    
    // Calculate potential distance gains from equipment changes
    analysis.recommendations.forEach(rec => {
      if (rec.type === 'equipment_change') {
        estimatedDistanceGain += 10; // Conservative estimate
      }
      if (rec.type === 'fitting_session') {
        estimatedDistanceGain += 5;
        estimatedAccuracyGain += 10;
      }
    });
    
    // Gapping improvements
    if (analysis.gapping.gaps.length > 0) {
      estimatedAccuracyGain += analysis.gapping.gaps.length * 5;
    }
    
    return {
      distance: Math.min(estimatedDistanceGain, 30), // Cap at 30 yards
      accuracy: Math.min(estimatedAccuracyGain, 25), // Cap at 25%
      confidence: 0.7
    };
  }

  // Helper methods
  calculateAverage(shots, metric) {
    const values = shots.map(shot => shot[metric]).filter(val => val !== null && val !== undefined);
    if (values.length === 0) return null;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateStdDev(shots, metric) {
    const values = shots.map(shot => shot[metric]).filter(val => val !== null && val !== undefined);
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance);
  }

  findBestShot(shots) {
    return shots.reduce((best, shot) => {
      if (!best || (shot.distance > best.distance)) {
        return shot;
      }
      return best;
    }, null);
  }

  sortClubsByDistance(a, b) {
    const order = ['driver', '3-wood', '5-wood', '3-hybrid', '4-hybrid', '5-hybrid',
                   '3-iron', '4-iron', '5-iron', '6-iron', '7-iron', '8-iron', '9-iron',
                   'pitching-wedge', 'sand-wedge', 'lob-wedge'];
    return order.indexOf(a) - order.indexOf(b);
  }

  getIdealGap(club1, club2) {
    const standard1 = this.gappingStandards[club1];
    const standard2 = this.gappingStandards[club2];
    
    if (standard1 && standard2) {
      return standard1.distance - standard2.distance;
    }
    
    return 15; // Default gap
  }

  getSkillLevel(handicap) {
    if (handicap <= 5) return 'tour';
    if (handicap <= 10) return 'low';
    if (handicap <= 18) return 'mid';
    return 'high';
  }

  getSuggestedEquipment(club, skillLevel, focus) {
    // Simplified equipment suggestions
    const suggestions = {
      'driver': {
        'high': { brand: 'TaylorMade', model: 'Stealth 2', reason: 'Forgiving with high MOI' },
        'mid': { brand: 'Callaway', model: 'Paradym', reason: 'Balanced performance' },
        'low': { brand: 'Titleist', model: 'TSR3', reason: 'Tour-level adjustability' }
      }
    };
    
    return suggestions[club]?.[skillLevel] || { brand: 'Generic', model: 'Game Improvement', reason: 'Forgiving design' };
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getComparisonGrade(ratio) {
    if (ratio >= 0.9) return 'Excellent';
    if (ratio >= 0.8) return 'Good';
    if (ratio >= 0.7) return 'Average';
    if (ratio >= 0.6) return 'Below Average';
    return 'Needs Improvement';
  }

  async healthCheck() {
    return {
      status: 'healthy',
      equipmentDatabase: Object.keys(this.equipmentDatabase).length,
      gappingStandards: Object.keys(this.gappingStandards).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = BagComparisonAgent; 