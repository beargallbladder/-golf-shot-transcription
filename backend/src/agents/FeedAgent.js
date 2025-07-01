/**
 * FeedAgent - Intelligent Community Features
 * Manages social feed, achievements, and community engagement
 */

class FeedAgent {
  constructor() {
    this.feedTypes = ['personal', 'friends', 'community', 'achievements'];
    this.engagementMetrics = {
      like: 1,
      comment: 3,
      share: 5,
      challenge: 10
    };
  }

  async updateFeed(user, shot, scoring) {
    try {
      console.log('📢 FeedAgent: Updating user feed');
      
      const feedUpdate = {
        personalFeed: await this.updatePersonalFeed(user, shot, scoring),
        communityFeed: await this.updateCommunityFeed(user, shot, scoring),
        achievements: await this.checkAchievements(user, shot, scoring),
        notifications: await this.generateNotifications(user, shot, scoring)
      };
      
      console.log('📢 Feed update complete');
      return feedUpdate;
      
    } catch (error) {
      console.error('📢 FeedAgent error:', error);
      // Don't throw error - feed updates are non-critical
      return null;
    }
  }

  async generateFeed(user, community) {
    try {
      console.log('📢 FeedAgent: Generating personalized feed');
      
      const feed = {
        personalFeed: await this.createPersonalFeed(user),
        communityHighlights: await this.selectCommunityHighlights(community),
        challenges: await this.generateChallenges(user, community),
        achievements: await this.celebrateAchievements(user, community),
        insights: await this.shareInsights(user, community)
      };
      
      return feed;
      
    } catch (error) {
      console.error('📢 FeedAgent error:', error);
      throw new Error(`Feed generation failed: ${error.message}`);
    }
  }

  async updatePersonalFeed(user, shot, scoring) {
    const feedItem = {
      id: this.generateId(),
      type: 'shot_analysis',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        handicap: user.handicap
      },
      content: {
        shot: {
          club: shot.club,
          distance: shot.distance,
          speed: shot.speed
        },
        score: scoring.overall.score,
        grade: scoring.overall.grade,
        isPersonalBest: scoring.breakdown.personalBest.isNewBest,
        insights: scoring.insights.slice(0, 2) // Top 2 insights
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      privacy: user.privacy || 'friends'
    };
    
    return feedItem;
  }

  async updateCommunityFeed(user, shot, scoring) {
    // Only add to community feed if it's a notable shot
    if (scoring.overall.score < 75 && !scoring.breakdown.personalBest.isNewBest) {
      return null;
    }
    
    const communityItem = {
      id: this.generateId(),
      type: 'community_highlight',
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        handicap: user.handicap
      },
      content: {
        achievement: this.getAchievementType(scoring),
        shot: {
          club: shot.club,
          distance: shot.distance
        },
        score: scoring.overall.score,
        highlight: this.generateHighlight(shot, scoring)
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        challenges: 0
      }
    };
    
    return communityItem;
  }

  async checkAchievements(user, shot, scoring) {
    const achievements = [];
    
    // Personal best achievement
    if (scoring.breakdown.personalBest.isNewBest) {
      achievements.push({
        type: 'personal_best',
        club: shot.club,
        value: shot.distance,
        timestamp: new Date().toISOString(),
        badge: '🎯',
        title: `New ${shot.club} Personal Best!`,
        description: `${shot.distance} yards - your best yet!`
      });
    }
    
    // Score-based achievements
    if (scoring.overall.score >= 90) {
      achievements.push({
        type: 'perfect_shot',
        score: scoring.overall.score,
        timestamp: new Date().toISOString(),
        badge: '🏆',
        title: 'Perfect Shot!',
        description: `Scored ${scoring.overall.score} - nearly perfect!`
      });
    }
    
    // Tour-level achievement
    if (scoring.breakdown.proComparison.score > 80) {
      achievements.push({
        type: 'tour_level',
        comparison: scoring.breakdown.proComparison.score,
        timestamp: new Date().toISOString(),
        badge: '⭐',
        title: 'Tour-Level Performance!',
        description: 'Your shot matches professional standards!'
      });
    }
    
    return achievements;
  }

  async generateNotifications(user, shot, scoring) {
    const notifications = [];
    
    // Personal best notification
    if (scoring.breakdown.personalBest.isNewBest) {
      notifications.push({
        type: 'achievement',
        priority: 'high',
        title: 'New Personal Best! 🎉',
        message: `You just hit your best ${shot.club} shot - ${shot.distance} yards!`,
        action: 'share_achievement'
      });
    }
    
    // Improvement notification
    if (scoring.overall.score > 80) {
      notifications.push({
        type: 'encouragement',
        priority: 'medium',
        title: 'Great Shot! 💪',
        message: `Score: ${scoring.overall.score} - You're really improving!`,
        action: 'view_progress'
      });
    }
    
    // Recommendation notification
    if (scoring.recommendations.length > 0) {
      notifications.push({
        type: 'tip',
        priority: 'low',
        title: 'Improvement Tip 💡',
        message: scoring.recommendations[0],
        action: 'view_recommendations'
      });
    }
    
    return notifications;
  }

  async createPersonalFeed(user) {
    // Mock personal feed items (would come from database)
    const recentShots = [
      {
        date: '2024-12-28',
        club: '7-iron',
        distance: 155,
        score: 85,
        highlight: 'Great contact!'
      },
      {
        date: '2024-12-27',
        club: 'driver',
        distance: 275,
        score: 92,
        highlight: 'New personal best!'
      }
    ];
    
    return recentShots.map(shot => ({
      type: 'personal_shot',
      content: shot,
      timestamp: shot.date
    }));
  }

  async selectCommunityHighlights(community) {
    // Mock community highlights
    const highlights = [
      {
        user: 'Mike Johnson',
        achievement: 'Broke 300 yards with driver!',
        distance: 305,
        likes: 15,
        comments: 3
      },
      {
        user: 'Sarah Chen',
        achievement: 'Hole-in-one on 7th hole!',
        club: '8-iron',
        likes: 47,
        comments: 12
      }
    ];
    
    return highlights.map(highlight => ({
      type: 'community_highlight',
      content: highlight,
      engagement: {
        likes: highlight.likes,
        comments: highlight.comments
      }
    }));
  }

  async generateChallenges(user, community) {
    const challenges = [];
    
    // Personal challenges based on history
    challenges.push({
      type: 'personal',
      title: 'Distance Challenge',
      description: 'Beat your driver personal best',
      target: (user.personalBests?.driver || 250) + 10,
      reward: 'Distance Champion badge',
      expires: this.getExpiryDate(7) // 7 days
    });
    
    // Community challenges
    challenges.push({
      type: 'community',
      title: 'Weekly Accuracy Challenge',
      description: 'Most consistent iron shots this week',
      participants: 23,
      reward: 'Accuracy Master badge',
      expires: this.getExpiryDate(7)
    });
    
    // Skill-based challenges
    if (user.handicap > 15) {
      challenges.push({
        type: 'skill_building',
        title: 'Consistency Challenge',
        description: 'Hit 5 shots within 10 yards of each other',
        progress: '2/5',
        reward: 'Consistency badge',
        expires: this.getExpiryDate(14)
      });
    }
    
    return challenges;
  }

  async celebrateAchievements(user, community) {
    const celebrations = [];
    
    // Recent achievements
    if (user.recentAchievements) {
      user.recentAchievements.forEach(achievement => {
        celebrations.push({
          type: 'celebration',
          achievement: achievement,
          socialShare: this.generateCelebrationShare(achievement),
          communityRecognition: true
        });
      });
    }
    
    // Milestone celebrations
    const totalShots = user.totalShots || 0;
    if (totalShots > 0 && totalShots % 50 === 0) {
      celebrations.push({
        type: 'milestone',
        title: `${totalShots} Shots Analyzed!`,
        description: 'Keep up the great work!',
        badge: '📊',
        socialShare: {
          text: `Just analyzed my ${totalShots}th shot with Beat My Bag! 🏌️‍♂️`,
          hashtags: ['#BeatMyBag', '#Golf', '#Progress']
        }
      });
    }
    
    return celebrations;
  }

  async shareInsights(user, community) {
    const insights = [];
    
    // Personalized insights
    insights.push({
      type: 'personal_insight',
      title: 'Your Progress This Week',
      content: 'Your average distance has improved by 8 yards!',
      visualization: 'progress_chart',
      shareable: true
    });
    
    // Community insights
    insights.push({
      type: 'community_insight',
      title: 'Community Trends',
      content: 'Most golfers are improving their 7-iron consistency',
      comparison: 'You rank in the top 25% for 7-iron accuracy',
      shareable: false
    });
    
    // Equipment insights
    if (user.equipment) {
      insights.push({
        type: 'equipment_insight',
        title: 'Equipment Performance',
        content: 'Your driver is performing 15% above average for your handicap',
        recommendation: 'Consider similar specs for your irons',
        shareable: true
      });
    }
    
    return insights;
  }

  getAchievementType(scoring) {
    if (scoring.breakdown.personalBest.isNewBest) return 'personal_best';
    if (scoring.overall.score >= 90) return 'perfect_shot';
    if (scoring.breakdown.proComparison.score > 80) return 'tour_level';
    return 'good_shot';
  }

  generateHighlight(shot, scoring) {
    if (scoring.breakdown.personalBest.isNewBest) {
      return `New personal best with ${shot.club} - ${shot.distance} yards!`;
    }
    
    if (scoring.overall.score >= 90) {
      return `Perfect shot with ${shot.club} - scored ${scoring.overall.score}!`;
    }
    
    return `Great ${shot.club} shot - ${shot.distance} yards!`;
  }

  generateCelebrationShare(achievement) {
    return {
      text: `🎉 Just achieved: ${achievement.title}! ${achievement.description}`,
      hashtags: ['#BeatMyBag', '#Golf', '#Achievement'],
      image: 'achievement_badge'
    };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getExpiryDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  async healthCheck() {
    return {
      status: 'healthy',
      feedTypes: this.feedTypes.length,
      engagementMetrics: Object.keys(this.engagementMetrics).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = FeedAgent; 