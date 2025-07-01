/**
 * UXAgent - Intelligent User Experience Optimization
 * Adapts interface and workflow based on user behavior and preferences
 */

class UXAgent {
  constructor() {
    this.experienceProfiles = {
      beginner: { complexity: 'low', guidance: 'high', automation: 'high' },
      intermediate: { complexity: 'medium', guidance: 'medium', automation: 'medium' },
      advanced: { complexity: 'high', guidance: 'low', automation: 'low' }
    };
  }

  async optimizeResponse(data) {
    try {
      console.log('🎨 UXAgent: Optimizing user experience');
      
      const { shot, scoring, bagAnalysis, user, context } = data;
      
      const userProfile = this.analyzeUserProfile(user, context);
      const optimizedResponse = {
        presentation: this.optimizePresentationLayer(shot, scoring, userProfile),
        insights: this.prioritizeInsights(scoring.insights, userProfile),
        recommendations: this.personalizeRecommendations(scoring.recommendations, userProfile),
        interface: this.adaptInterface(userProfile),
        workflow: this.optimizeWorkflow(userProfile),
        engagement: this.enhanceEngagement(shot, scoring, userProfile)
      };
      
      console.log('🎨 Experience optimization complete');
      return optimizedResponse;
      
    } catch (error) {
      console.error('🎨 UXAgent error:', error);
      throw new Error(`UX optimization failed: ${error.message}`);
    }
  }

  analyzeUserProfile(user, context) {
    const handicap = user.handicap || 15;
    const skillLevel = this.getSkillLevel(handicap);
    const sessionCount = user.sessionCount || 1;
    const deviceType = context.device || 'desktop';
    
    return {
      skillLevel,
      experience: sessionCount > 10 ? 'experienced' : 'new',
      deviceType,
      preferences: user.preferences || {},
      handicap
    };
  }

  optimizePresentationLayer(shot, scoring, userProfile) {
    const presentation = {
      layout: this.selectLayout(userProfile),
      metrics: this.selectMetrics(shot, userProfile),
      visualizations: this.selectVisualizations(scoring, userProfile),
      emphasis: this.determineEmphasis(scoring, userProfile)
    };
    
    return presentation;
  }

  selectLayout(userProfile) {
    if (userProfile.deviceType === 'mobile') {
      return 'vertical-stack';
    }
    
    switch (userProfile.skillLevel) {
      case 'beginner':
        return 'simplified-grid';
      case 'advanced':
        return 'detailed-dashboard';
      default:
        return 'balanced-layout';
    }
  }

  selectMetrics(shot, userProfile) {
    const baseMetrics = ['distance', 'speed'];
    
    if (userProfile.skillLevel === 'beginner') {
      return baseMetrics;
    }
    
    if (userProfile.skillLevel === 'advanced') {
      return [...baseMetrics, 'spin', 'launchAngle', 'smashFactor', 'ballFlight'];
    }
    
    return [...baseMetrics, 'spin', 'launchAngle'];
  }

  selectVisualizations(scoring, userProfile) {
    const visualizations = [];
    
    // Always show basic score
    visualizations.push('score-gauge');
    
    if (userProfile.skillLevel !== 'beginner') {
      visualizations.push('comparison-chart');
    }
    
    if (scoring.breakdown.personalBest.isNewBest) {
      visualizations.push('celebration-animation');
    }
    
    if (userProfile.skillLevel === 'advanced') {
      visualizations.push('detailed-breakdown');
      visualizations.push('trend-analysis');
    }
    
    return visualizations;
  }

  determineEmphasis(scoring, userProfile) {
    const emphasis = [];
    
    // Personal best emphasis
    if (scoring.breakdown.personalBest.isNewBest) {
      emphasis.push({ type: 'celebration', priority: 'high', message: 'New Personal Best!' });
    }
    
    // Skill-based emphasis
    if (userProfile.skillLevel === 'beginner' && scoring.overall.score > 70) {
      emphasis.push({ type: 'encouragement', priority: 'medium', message: 'Great shot!' });
    }
    
    if (userProfile.skillLevel === 'advanced' && scoring.breakdown.proComparison.score > 80) {
      emphasis.push({ type: 'achievement', priority: 'high', message: 'Tour-level performance!' });
    }
    
    return emphasis;
  }

  prioritizeInsights(insights, userProfile) {
    // Sort insights based on user profile
    const prioritized = [...insights];
    
    if (userProfile.skillLevel === 'beginner') {
      // Focus on positive reinforcement for beginners
      prioritized.sort((a, b) => {
        if (a.includes('🎉') || a.includes('💪')) return -1;
        if (b.includes('🎉') || b.includes('💪')) return 1;
        return 0;
      });
    }
    
    // Limit insights based on experience
    const maxInsights = userProfile.experience === 'new' ? 2 : 4;
    return prioritized.slice(0, maxInsights);
  }

  personalizeRecommendations(recommendations, userProfile) {
    const personalized = recommendations.map(rec => {
      let personalizedRec = { ...rec };
      
      // Adjust language based on skill level
      if (userProfile.skillLevel === 'beginner') {
        personalizedRec = this.simplifyLanguage(personalizedRec);
      } else if (userProfile.skillLevel === 'advanced') {
        personalizedRec = this.addTechnicalDetail(personalizedRec);
      }
      
      return personalizedRec;
    });
    
    // Limit recommendations for beginners
    const maxRecs = userProfile.skillLevel === 'beginner' ? 2 : 5;
    return personalized.slice(0, maxRecs);
  }

  simplifyLanguage(recommendation) {
    const simplified = { ...recommendation };
    
    // Replace technical terms with simpler language
    simplified = simplified.replace(/smash factor/gi, 'contact quality');
    simplified = simplified.replace(/launch angle/gi, 'ball flight angle');
    simplified = simplified.replace(/spin rate/gi, 'ball spin');
    
    return simplified;
  }

  addTechnicalDetail(recommendation) {
    // Add more technical context for advanced users
    return `${recommendation} (Consider: shaft flex, lie angle, and swing plane adjustments)`;
  }

  adaptInterface(userProfile) {
    const interface = {
      complexity: this.experienceProfiles[userProfile.skillLevel].complexity,
      guidance: this.experienceProfiles[userProfile.skillLevel].guidance,
      automation: this.experienceProfiles[userProfile.skillLevel].automation
    };
    
    // Device-specific adaptations
    if (userProfile.deviceType === 'mobile') {
      interface.touchOptimized = true;
      interface.gestureControls = true;
    }
    
    return interface;
  }

  optimizeWorkflow(userProfile) {
    const workflow = {
      steps: this.defineWorkflowSteps(userProfile),
      automation: this.defineAutomation(userProfile),
      shortcuts: this.defineShortcuts(userProfile)
    };
    
    return workflow;
  }

  defineWorkflowSteps(userProfile) {
    if (userProfile.skillLevel === 'beginner') {
      return [
        'upload-shot',
        'view-basic-results',
        'get-simple-tip',
        'celebrate-achievement'
      ];
    }
    
    if (userProfile.skillLevel === 'advanced') {
      return [
        'upload-shot',
        'analyze-technical-data',
        'compare-to-benchmarks',
        'review-equipment-recommendations',
        'plan-improvements'
      ];
    }
    
    return [
      'upload-shot',
      'view-results',
      'understand-insights',
      'follow-recommendations'
    ];
  }

  defineAutomation(userProfile) {
    const automationLevel = this.experienceProfiles[userProfile.skillLevel].automation;
    
    const automation = {
      autoSave: true,
      autoShare: userProfile.preferences.autoShare || false,
      autoRecommendations: automationLevel === 'high'
    };
    
    return automation;
  }

  defineShortcuts(userProfile) {
    if (userProfile.experience === 'experienced') {
      return [
        'quick-upload',
        'compare-last-shot',
        'share-achievement',
        'view-trends'
      ];
    }
    
    return ['quick-upload', 'share-achievement'];
  }

  enhanceEngagement(shot, scoring, userProfile) {
    const engagement = {
      gamification: this.addGamification(scoring, userProfile),
      social: this.enhanceSocial(shot, scoring, userProfile),
      motivation: this.addMotivation(scoring, userProfile),
      progression: this.trackProgression(userProfile)
    };
    
    return engagement;
  }

  addGamification(scoring, userProfile) {
    const gamification = [];
    
    // Achievement badges
    if (scoring.overall.score > 90) {
      gamification.push({ type: 'badge', name: 'Perfect Shot', icon: '🏆' });
    }
    
    if (scoring.breakdown.personalBest.isNewBest) {
      gamification.push({ type: 'badge', name: 'Personal Best', icon: '🎯' });
    }
    
    // Streak tracking
    if (userProfile.currentStreak > 5) {
      gamification.push({ type: 'streak', count: userProfile.currentStreak, icon: '🔥' });
    }
    
    return gamification;
  }

  enhanceSocial(shot, scoring, userProfile) {
    const social = {
      shareableContent: this.generateShareableContent(shot, scoring),
      challenges: this.suggestChallenges(userProfile),
      community: this.recommendCommunity(userProfile)
    };
    
    return social;
  }

  generateShareableContent(shot, scoring) {
    const content = {
      text: `Just hit a ${shot.club} ${shot.distance} yards with a score of ${scoring.overall.score}!`,
      hashtags: ['#BeatMyBag', '#Golf', '#PersonalBest'],
      image: 'auto-generated-shot-graphic'
    };
    
    return content;
  }

  suggestChallenges(userProfile) {
    const challenges = [];
    
    if (userProfile.skillLevel === 'beginner') {
      challenges.push('Hit 5 shots over 150 yards');
    } else {
      challenges.push('Beat your personal best 3 times this week');
    }
    
    return challenges;
  }

  recommendCommunity(userProfile) {
    return {
      groups: [`${userProfile.handicap}-handicap golfers`, 'Local golf community'],
      events: ['Weekly distance challenge', 'Monthly accuracy contest']
    };
  }

  addMotivation(scoring, userProfile) {
    const motivation = [];
    
    if (scoring.overall.score < 50) {
      motivation.push({
        type: 'encouragement',
        message: 'Every shot is a learning opportunity! Keep practicing!',
        action: 'View practice tips'
      });
    } else if (scoring.overall.score > 80) {
      motivation.push({
        type: 'celebration',
        message: 'Outstanding shot! You\'re really improving!',
        action: 'Share your success'
      });
    }
    
    return motivation;
  }

  trackProgression(userProfile) {
    return {
      currentLevel: this.calculateLevel(userProfile),
      nextMilestone: this.getNextMilestone(userProfile),
      progressPercentage: this.calculateProgress(userProfile)
    };
  }

  calculateLevel(userProfile) {
    const sessionCount = userProfile.sessionCount || 1;
    return Math.floor(sessionCount / 10) + 1;
  }

  getNextMilestone(userProfile) {
    const currentLevel = this.calculateLevel(userProfile);
    return `Level ${currentLevel + 1}: ${(currentLevel + 1) * 10} shots analyzed`;
  }

  calculateProgress(userProfile) {
    const sessionCount = userProfile.sessionCount || 1;
    const currentLevelStart = Math.floor(sessionCount / 10) * 10;
    const progressInLevel = sessionCount - currentLevelStart;
    return (progressInLevel / 10) * 100;
  }

  getSkillLevel(handicap) {
    if (handicap <= 5) return 'advanced';
    if (handicap <= 15) return 'intermediate';
    return 'beginner';
  }

  async healthCheck() {
    return {
      status: 'healthy',
      experienceProfiles: Object.keys(this.experienceProfiles).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = UXAgent; 