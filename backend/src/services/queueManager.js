const Bull = require('bull');
const { cache } = require('../config/redis');

class QueueManager {
  constructor() {
    this.queues = {};
    this.processors = {};
    this.redisConfig = {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD,
        db: 1, // Use different DB for queues
      }
    };
    
    this.initializeQueues();
  }

  initializeQueues() {
    // High priority queue for real-time features
    this.queues.realtime = new Bull('realtime', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    // Shot processing queue
    this.queues.shotProcessing = new Bull('shot-processing', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 10,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // AI analysis queue (potentially expensive operations)
    this.queues.aiAnalysis = new Bull('ai-analysis', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    });

    // Email queue
    this.queues.email = new Bull('email', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 20,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    // Analytics queue for non-critical tracking
    this.queues.analytics = new Bull('analytics', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 10000,
        },
      },
    });

    // Leaderboard update queue
    this.queues.leaderboard = new Bull('leaderboard', {
      ...this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.setupProcessors();
    this.setupEventHandlers();

    console.log('🚀 Queue Manager initialized with 6 queues');
  }

  setupProcessors() {
    // Real-time processors (high concurrency)
    this.queues.realtime.process('websocket-broadcast', 10, this.processWebSocketBroadcast.bind(this));
    this.queues.realtime.process('push-notification', 5, this.processPushNotification.bind(this));

    // Shot processing (moderate concurrency)
    this.queues.shotProcessing.process('analyze-shot', 3, this.processAnalyzeShot.bind(this));
    this.queues.shotProcessing.process('update-stats', 5, this.processUpdateStats.bind(this));
    this.queues.shotProcessing.process('generate-insights', 2, this.processGenerateInsights.bind(this));

    // AI analysis (limited concurrency due to API limits)
    this.queues.aiAnalysis.process('openai-analysis', 2, this.processOpenAIAnalysis.bind(this));
    this.queues.aiAnalysis.process('image-processing', 1, this.processImageAnalysis.bind(this));

    // Email processing
    this.queues.email.process('send-email', 5, this.processSendEmail.bind(this));
    this.queues.email.process('retailer-activation', 3, this.processRetailerActivation.bind(this));

    // Analytics processing (batch friendly)
    this.queues.analytics.process('track-event', 10, this.processTrackEvent.bind(this));
    this.queues.analytics.process('aggregate-stats', 1, this.processAggregateStats.bind(this));

    // Leaderboard processing
    this.queues.leaderboard.process('update-rankings', 2, this.processUpdateRankings.bind(this));
    this.queues.leaderboard.process('calculate-achievements', 1, this.processCalculateAchievements.bind(this));
  }

  setupEventHandlers() {
    Object.entries(this.queues).forEach(([queueName, queue]) => {
      queue.on('completed', (job, result) => {
        console.log(`✅ Queue ${queueName} job ${job.id} completed:`, result?.message || 'Success');
      });

      queue.on('failed', (job, err) => {
        console.error(`❌ Queue ${queueName} job ${job.id} failed:`, err.message);
      });

      queue.on('stalled', (job) => {
        console.warn(`⚠️ Queue ${queueName} job ${job.id} stalled`);
      });
    });
  }

  // Job Processing Methods

  async processWebSocketBroadcast(job) {
    const { event, data, room } = job.data;
    
    try {
      const websocket = require('./websocket');
      
      if (room) {
        websocket.broadcastToRoom(room, { type: event, data });
      } else {
        websocket.broadcastToAll({ type: event, data });
      }
      
      return { success: true, message: `Broadcast ${event} sent` };
    } catch (error) {
      throw new Error(`WebSocket broadcast failed: ${error.message}`);
    }
  }

  async processPushNotification(job) {
    const { userId, title, body, data } = job.data;
    
    try {
      // Implement push notification logic here
      // This would integrate with FCM, APNs, etc.
      
      console.log(`📱 Push notification sent to user ${userId}: ${title}`);
      return { success: true, message: 'Push notification sent' };
    } catch (error) {
      throw new Error(`Push notification failed: ${error.message}`);
    }
  }

  async processAnalyzeShot(job) {
    const { shotId, imageUrl, userId } = job.data;
    
    try {
      // Add to AI analysis queue for expensive processing
      await this.addJob('aiAnalysis', 'openai-analysis', {
        shotId,
        imageUrl,
        userId
      }, { priority: 5 });
      
      // Quick preliminary analysis
      const quickAnalysis = {
        shotId,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + 30000) // 30 seconds
      };
      
      return { success: true, analysis: quickAnalysis };
    } catch (error) {
      throw new Error(`Shot analysis failed: ${error.message}`);
    }
  }

  async processUpdateStats(job) {
    const { userId, shotData } = job.data;
    
    try {
      // Update user statistics in database
      const db = require('../database/db');
      
      await db.query(`
        UPDATE user_stats 
        SET 
          total_shots = total_shots + 1,
          avg_distance = (avg_distance * total_shots + $2) / (total_shots + 1),
          last_shot_date = NOW()
        WHERE user_id = $1
      `, [userId, shotData.distance]);
      
      // Trigger leaderboard update
      await this.addJob('leaderboard', 'update-rankings', { userId }, { delay: 5000 });
      
      return { success: true, message: 'Stats updated' };
    } catch (error) {
      throw new Error(`Stats update failed: ${error.message}`);
    }
  }

  async processGenerateInsights(job) {
    const { userId, timeframe = '30d' } = job.data;
    
    try {
      const db = require('../database/db');
      
      // Get recent shots for analysis
      const shots = await db.query(`
        SELECT * FROM shots 
        WHERE user_id = $1 
          AND created_at > NOW() - INTERVAL $2
        ORDER BY created_at DESC
      `, [userId, timeframe]);
      
      // Generate insights
      const insights = this.analyzeUserProgress(shots.rows);
      
      // Cache insights
      await cache.set(`user_insights:${userId}`, insights, 86400); // 24 hours
      
      return { success: true, insights };
    } catch (error) {
      throw new Error(`Insight generation failed: ${error.message}`);
    }
  }

  async processOpenAIAnalysis(job) {
    const { shotId, imageUrl, userId } = job.data;
    
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Simulate OpenAI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = {
        shotId,
        distance: Math.floor(Math.random() * 100) + 200,
        club: 'Driver',
        accuracy: Math.floor(Math.random() * 20) + 80,
        recommendations: 'Great shot! Try adjusting your grip for more distance.'
      };
      
      // Update shot record
      const db = require('../database/db');
      await db.query(`
        UPDATE shots 
        SET analysis = $2, analyzed_at = NOW()
        WHERE id = $1
      `, [shotId, JSON.stringify(analysis)]);
      
      // Notify user via WebSocket
      await this.addJob('realtime', 'websocket-broadcast', {
        event: 'shot_analysis_complete',
        data: { shotId, analysis },
        room: `user:${userId}`
      });
      
      return { success: true, analysis };
    } catch (error) {
      throw new Error(`OpenAI analysis failed: ${error.message}`);
    }
  }

  async processImageAnalysis(job) {
    const { imageUrl, shotId } = job.data;
    
    try {
      // Implement image processing logic
      // This could involve computer vision APIs, image optimization, etc.
      
      console.log(`🖼️ Processing image for shot ${shotId}`);
      return { success: true, message: 'Image processed' };
    } catch (error) {
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  async processSendEmail(job) {
    const { to, subject, html, template, data } = job.data;
    
    try {
      // Implement email sending logic (SendGrid, SES, etc.)
      console.log(`📧 Email sent to ${to}: ${subject}`);
      return { success: true, message: 'Email sent' };
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async processRetailerActivation(job) {
    const { email, companyName, activationToken } = job.data;
    
    try {
      // Send retailer activation email
      await this.addJob('email', 'send-email', {
        to: email,
        subject: 'Activate Your GolfSimple Retailer Account',
        template: 'retailer-activation',
        data: { companyName, activationToken }
      });
      
      return { success: true, message: 'Activation email queued' };
    } catch (error) {
      throw new Error(`Retailer activation failed: ${error.message}`);
    }
  }

  async processTrackEvent(job) {
    const { event, userId, properties } = job.data;
    
    try {
      // Track analytics event
      const timestamp = new Date();
      await cache.setex(`analytics:${event}:${timestamp.getTime()}`, 3600, JSON.stringify({
        event,
        userId,
        properties,
        timestamp
      }));
      
      return { success: true, message: 'Event tracked' };
    } catch (error) {
      throw new Error(`Event tracking failed: ${error.message}`);
    }
  }

  async processAggregateStats(job) {
    const { date = new Date().toISOString().split('T')[0] } = job.data;
    
    try {
      const db = require('../database/db');
      
      // Aggregate daily statistics
      await db.query(`
        INSERT INTO daily_stats (date, total_shots, unique_users, avg_distance)
        SELECT 
          $1::date,
          COUNT(*),
          COUNT(DISTINCT user_id),
          AVG(distance)
        FROM shots
        WHERE DATE(created_at) = $1::date
        ON CONFLICT (date) DO UPDATE SET
          total_shots = EXCLUDED.total_shots,
          unique_users = EXCLUDED.unique_users,
          avg_distance = EXCLUDED.avg_distance
      `, [date]);
      
      return { success: true, message: 'Stats aggregated' };
    } catch (error) {
      throw new Error(`Stats aggregation failed: ${error.message}`);
    }
  }

  async processUpdateRankings(job) {
    const { userId, category = 'distance' } = job.data;
    
    try {
      // Recalculate rankings for leaderboard
      const rankings = await this.calculateRankings(category);
      
      // Cache updated rankings
      await cache.setex(`leaderboard:${category}`, 300, JSON.stringify(rankings));
      
      // Broadcast update to WebSocket clients
      await this.addJob('realtime', 'websocket-broadcast', {
        event: 'leaderboard_update',
        data: { category, rankings: rankings.slice(0, 10) },
        room: `leaderboard:${category}`
      });
      
      return { success: true, message: 'Rankings updated' };
    } catch (error) {
      throw new Error(`Ranking update failed: ${error.message}`);
    }
  }

  async processCalculateAchievements(job) {
    const { userId } = job.data;
    
    try {
      const achievements = await this.checkUserAchievements(userId);
      
      if (achievements.newAchievements.length > 0) {
        // Notify user of new achievements
        await this.addJob('realtime', 'websocket-broadcast', {
          event: 'achievements_unlocked',
          data: achievements.newAchievements,
          room: `user:${userId}`
        });
      }
      
      return { success: true, achievements: achievements.newAchievements };
    } catch (error) {
      throw new Error(`Achievement calculation failed: ${error.message}`);
    }
  }

  // Public API Methods

  async addJob(queueName, jobType, data, options = {}) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    const job = await this.queues[queueName].add(jobType, data, options);
    console.log(`➕ Job added to ${queueName}:${jobType} with ID ${job.id}`);
    return job;
  }

  async getQueueStats() {
    const stats = {};
    
    for (const [queueName, queue] of Object.entries(this.queues)) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();
      
      stats[queueName] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    }
    
    return stats;
  }

  // Helper Methods

  analyzeUserProgress(shots) {
    if (shots.length === 0) return { message: 'Not enough data for insights' };
    
    const distances = shots.map(s => s.distance).filter(d => d > 0);
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    return {
      totalShots: shots.length,
      averageDistance: Math.round(avgDistance),
      trend: distances.length > 1 ? (distances[0] > distances[distances.length - 1] ? 'improving' : 'declining') : 'stable',
      recommendation: 'Keep practicing to maintain consistency!'
    };
  }

  async calculateRankings(category) {
    const db = require('../database/db');
    
    const result = await db.query(`
      SELECT 
        u.id, u.name, u.avatar_url,
        MAX(s.distance) as max_distance,
        COUNT(s.id) as shot_count
      FROM users u
      JOIN shots s ON u.id = s.user_id
      WHERE s.is_public = true
        AND s.created_at > NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY max_distance DESC
      LIMIT 50
    `);
    
    return result.rows.map((row, index) => ({
      rank: index + 1,
      ...row
    }));
  }

  async checkUserAchievements(userId) {
    // Simplified achievement checking
    return {
      newAchievements: [],
      totalAchievements: 5
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Queue Manager...');
    
    await Promise.all(
      Object.values(this.queues).map(queue => queue.close())
    );
    
    console.log('✅ Queue Manager shutdown complete');
  }
}

module.exports = new QueueManager();