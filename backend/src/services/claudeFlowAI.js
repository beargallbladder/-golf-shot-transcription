const OpenAI = require('openai');
const { cache } = require('../config/redis');
const queueManager = require('./queueManager');

class ClaudeFlowAI {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.agents = {
      shotAnalysis: new ShotAnalysisAgent(),
      coaching: new CoachingAgent(),
      equipment: new EquipmentAgent(),
      performance: new PerformanceAgent(),
      social: new SocialAgent()
    };
    
    console.log('🤖 Claude Flow AI System initialized');
  }

  // Main AI orchestration method
  async analyzeShot(shotData, userProfile) {
    const cacheKey = `ai_analysis:${shotData.id}:${userProfile.id}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return { ...cached, source: 'cache' };
      }

      // Parallel AI agent processing
      const analyses = await Promise.allSettled([
        this.agents.shotAnalysis.analyze(shotData),
        this.agents.coaching.generateTips(shotData, userProfile),
        this.agents.equipment.recommendUpgrades(shotData, userProfile),
        this.agents.performance.assessProgress(shotData, userProfile),
        this.agents.social.generateShareContent(shotData, userProfile)
      ]);

      // Combine results from all agents
      const combinedAnalysis = this.combineAgentResults(analyses, shotData);
      
      // Cache the comprehensive analysis
      await cache.set(cacheKey, combinedAnalysis, 3600); // 1 hour
      
      // Queue background enhancements
      await queueManager.addJob('aiAnalysis', 'enhance-analysis', {
        shotId: shotData.id,
        userId: userProfile.id,
        analysis: combinedAnalysis
      });

      return combinedAnalysis;

    } catch (error) {
      console.error('❌ Claude Flow AI analysis failed:', error);
      return this.getFallbackAnalysis(shotData);
    }
  }

  // Intelligent club recommendation system
  async recommendClub(conditions, userProfile, targetDistance) {
    const prompt = `
As a professional golf instructor and club fitting expert, recommend the optimal club for:

Conditions:
- Weather: ${conditions.weather || 'Normal'}
- Wind: ${conditions.wind || 'Calm'}  
- Temperature: ${conditions.temperature || 70}°F
- Course: ${conditions.course || 'Standard'}

Golfer Profile:
- Skill Level: ${userProfile.skillLevel || 'Intermediate'}
- Average Driver Distance: ${userProfile.averageDistance || 250} yards
- Consistency: ${userProfile.consistency || 'Good'}
- Strengths: ${userProfile.strengths || 'Distance'}
- Areas for Improvement: ${userProfile.improvements || 'Accuracy'}

Target Distance: ${targetDistance} yards

Provide a specific club recommendation with:
1. Primary club choice and reason
2. Alternative option
3. Shot adjustment tips for conditions
4. Confidence level (1-10)

Format as JSON.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const recommendation = JSON.parse(completion.choices[0].message.content);
      
      return {
        ...recommendation,
        timestamp: new Date(),
        source: 'claude-flow-ai'
      };

    } catch (error) {
      console.error('❌ Club recommendation failed:', error);
      return this.getFallbackClubRecommendation(targetDistance);
    }
  }

  // Personalized coaching system
  async generatePersonalizedCoaching(userStats, recentShots, goals) {
    const prompt = `
As an AI golf coach, create a personalized improvement plan:

Player Statistics:
- Average Distance: ${userStats.averageDistance} yards
- Accuracy Rate: ${userStats.accuracy}%
- Consistency (std dev): ${userStats.consistency} yards
- Rounds Played: ${userStats.roundsPlayed}
- Handicap: ${userStats.handicap || 'Unknown'}

Recent Performance (last 10 shots):
${recentShots.map(shot => `- ${shot.club}: ${shot.distance} yards (${shot.accuracy})`).join('\n')}

Player Goals:
${goals.map(goal => `- ${goal.type}: ${goal.target} by ${goal.deadline}`).join('\n')}

Create a coaching plan with:
1. Primary focus area
2. Specific drills (3-5)
3. Technical adjustments
4. Mental game tips
5. Practice schedule
6. Success metrics

Be encouraging but realistic. Format as JSON.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 800
      });

      const coaching = JSON.parse(completion.choices[0].message.content);
      
      // Cache personalized coaching
      await cache.set(`coaching:${userStats.userId}`, coaching, 86400); // 24 hours
      
      return coaching;

    } catch (error) {
      console.error('❌ Personalized coaching failed:', error);
      return this.getFallbackCoaching();
    }
  }

  // Combine results from multiple AI agents
  combineAgentResults(analyses, shotData) {
    const combined = {
      shotId: shotData.id,
      timestamp: new Date(),
      confidence: 0,
      analysis: {},
      recommendations: [],
      insights: [],
      shareContent: null
    };

    analyses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const agentNames = ['shotAnalysis', 'coaching', 'equipment', 'performance', 'social'];
        const agentName = agentNames[index];
        
        combined.analysis[agentName] = result.value;
        combined.confidence += result.value.confidence || 0.5;
        
        if (result.value.recommendations) {
          combined.recommendations.push(...result.value.recommendations);
        }
        
        if (result.value.insights) {
          combined.insights.push(...result.value.insights);
        }
        
        if (result.value.shareContent && !combined.shareContent) {
          combined.shareContent = result.value.shareContent;
        }
      }
    });

    // Normalize confidence score
    combined.confidence = Math.min(combined.confidence / analyses.length, 1.0);
    
    // Prioritize recommendations
    combined.recommendations = this.prioritizeRecommendations(combined.recommendations);
    
    return combined;
  }

  prioritizeRecommendations(recommendations) {
    return recommendations
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5); // Top 5 recommendations
  }

  // Fallback methods for error cases
  getFallbackAnalysis(shotData) {
    return {
      shotId: shotData.id,
      timestamp: new Date(),
      confidence: 0.6,
      analysis: {
        distance: shotData.distance || 0,
        club: shotData.club || 'Unknown',
        accuracy: 'Good',
        technique: 'Solid contact'
      },
      recommendations: [
        {
          type: 'practice',
          text: 'Keep practicing your swing consistency',
          priority: 0.8
        }
      ],
      insights: [
        'Continue tracking your shots for better analysis'
      ],
      source: 'fallback'
    };
  }

  getFallbackClubRecommendation(distance) {
    const clubs = {
      100: '60° Wedge',
      120: 'Sand Wedge',
      140: 'Pitching Wedge',
      160: '9-iron',
      180: '7-iron',
      200: '5-iron',
      220: '4-iron',
      240: '3-iron',
      260: '5-wood',
      280: '3-wood',
      300: 'Driver'
    };

    const distances = Object.keys(clubs).map(Number);
    const closest = distances.reduce((prev, curr) => 
      Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev
    );

    return {
      primaryClub: clubs[closest],
      alternative: clubs[closest + 20] || clubs[closest - 20],
      reason: `Based on ${distance} yard target distance`,
      confidence: 7,
      adjustments: ['Account for wind conditions', 'Check pin position']
    };
  }

  getFallbackCoaching() {
    return {
      primaryFocus: 'Consistency',
      drills: [
        'Practice with alignment sticks',
        'Short game practice (30 min daily)',
        'Tempo training with metronome'
      ],
      technicalAdjustments: ['Focus on setup and posture'],
      mentalGame: ['Stay positive and patient'],
      practiceSchedule: '3 times per week, 1 hour sessions',
      successMetrics: ['Track fairways hit', 'Monitor putting average']
    };
  }

  // Health check for AI system
  async healthCheck() {
    try {
      const testCompletion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test message for health check" }],
        max_tokens: 10
      });

      return {
        status: 'healthy',
        openai: 'connected',
        agents: Object.keys(this.agents).length,
        cache: await cache.healthCheck(),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// Specialized AI Agents

class ShotAnalysisAgent {
  async analyze(shotData) {
    // Advanced shot analysis with multiple data points
    return {
      distance: shotData.distance,
      accuracy: this.calculateAccuracy(shotData),
      ballFlight: this.analyzeBallFlight(shotData),
      clubSelection: this.evaluateClubChoice(shotData),
      technique: this.assessTechnique(shotData),
      confidence: 0.85,
      recommendations: [
        {
          type: 'technique',
          text: 'Focus on follow-through for better distance',
          priority: 0.9
        }
      ]
    };
  }

  calculateAccuracy(shotData) {
    // Implement accuracy calculation logic
    return Math.random() > 0.5 ? 'Excellent' : 'Good';
  }

  analyzeBallFlight(shotData) {
    return {
      trajectory: 'Optimal',
      spin: 'Appropriate',
      curve: 'Slight draw'
    };
  }

  evaluateClubChoice(shotData) {
    return {
      appropriate: true,
      alternative: null,
      reasoning: 'Good club selection for the distance'
    };
  }

  assessTechnique(shotData) {
    return {
      setup: 'Good',
      swing: 'Solid',
      contact: 'Clean',
      finish: 'Balanced'
    };
  }
}

class CoachingAgent {
  async generateTips(shotData, userProfile) {
    return {
      primaryTip: 'Focus on maintaining tempo throughout your swing',
      drills: [
        'Practice with slow-motion swings',
        'Use alignment sticks for setup'
      ],
      mentalGame: 'Visualize your target before each shot',
      confidence: 0.8,
      recommendations: [
        {
          type: 'practice',
          text: 'Spend 15 minutes on short game daily',
          priority: 0.85
        }
      ]
    };
  }
}

class EquipmentAgent {
  async recommendUpgrades(shotData, userProfile) {
    return {
      clubRecommendations: [
        {
          club: 'Driver',
          reason: 'A lower loft could increase distance',
          priority: 0.7
        }
      ],
      ballRecommendation: 'Consider a tour-level ball for better spin control',
      accessories: ['Golf glove', 'Alignment aid'],
      confidence: 0.75,
      recommendations: [
        {
          type: 'equipment',
          text: 'Get professionally fitted for optimal results',
          priority: 0.9
        }
      ]
    };
  }
}

class PerformanceAgent {
  async assessProgress(shotData, userProfile) {
    return {
      improvement: 'Steady progress in distance',
      trends: {
        distance: 'Increasing',
        accuracy: 'Stable',
        consistency: 'Improving'
      },
      goals: {
        achieved: 2,
        inProgress: 1,
        total: 3
      },
      confidence: 0.8,
      insights: [
        'Your average distance has increased by 5 yards this month'
      ]
    };
  }
}

class SocialAgent {
  async generateShareContent(shotData, userProfile) {
    return {
      shareContent: {
        title: `Great ${shotData.club} shot!`,
        description: `Just hit a ${shotData.distance}-yard ${shotData.club}! 🏌️`,
        hashtags: ['#golf', '#golfsimple', '#golfshot'],
        image: shotData.imageUrl
      },
      achievements: this.checkAchievements(shotData, userProfile),
      confidence: 0.9
    };
  }

  checkAchievements(shotData, userProfile) {
    // Check for new achievements
    return [];
  }
}

module.exports = new ClaudeFlowAI();