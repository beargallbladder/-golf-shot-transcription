const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireJWT } = require('../middleware/auth');
const { analyzeShotImage, analyzeRetailerShotImage } = require('../services/openai');
const { query } = require('../database/db');
const { checkAndUpdatePersonalBest, getUserBag, getBagStats } = require('../services/personalBests');

const router = express.Router();

// Validation middleware for shot upload
const validateShotUpload = [
  body('imageBase64')
    .notEmpty()
    .withMessage('Image data is required')
    .matches(/^data:image\/(jpeg|jpg|png|webp);base64,/)
    .withMessage('Invalid image format. Must be JPEG, PNG, or WebP')
];

// POST /api/shots - Upload and analyze shot
router.post('/', requireJWT, validateShotUpload, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { imageBase64, fittingSessionId, customerEmail, retailerNotes, language } = req.body;
    const userId = req.user.id;

    // Get user account type for enhanced analysis
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    const { config } = require('../config/environment');
    const isRetailerWhitelisted = config.retailerBetaEmails.includes(user.email.toLowerCase());
    const isRetailer = user.account_type === 'retailer' && isRetailerWhitelisted;
    const userDailyLimit = user.daily_shot_limit || 10;

    // Skip daily limit for admin users and unlimited retailer plans
    if (req.user.is_admin || user.subscription_plan === 'unlimited') {
      console.log('🔑 Unlimited access detected - skipping daily limit');
    } else {
      // Check daily shot limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyCount = await query(`
        SELECT COUNT(*) as count
        FROM shots 
        WHERE user_id = $1 
        AND created_at >= $2 
        AND created_at < $3
      `, [userId, today.toISOString(), tomorrow.toISOString()]);

      const shotsToday = parseInt(dailyCount.rows[0].count);
      
      if (shotsToday >= userDailyLimit) {
        return res.status(429).json({
          error: 'Daily limit reached',
          message: `You have reached your daily limit of ${userDailyLimit} shot analyses. ${isRetailer ? 'Upgrade your plan for more shots.' : 'Try again tomorrow or upgrade to premium for unlimited shots.'}`,
          shotsUsed: shotsToday,
          dailyLimit: userDailyLimit,
          resetTime: tomorrow.toISOString()
        });
      }
    }

    // Analyze image with AI - NO FAKE DATA EVER
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Image analysis is not available without proper API configuration'
      });
    }

    // Use enhanced analysis for retailer accounts
    const shotData = isRetailer 
      ? await analyzeRetailerShotImage(imageBase64, { language })
      : await analyzeShotImage(imageBase64, { language });

    // Save shot to database with enhanced data for retailers
    let result;
    if (isRetailer) {
      result = await query(`
        INSERT INTO shots (
          user_id, speed, distance, spin, launch_angle, club, image_data,
          club_brand, club_model, shaft_type, shaft_flex, grip_type,
          loft_angle, lie_angle, retailer_notes, fitting_session_id,
          customer_email, is_fitting_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        userId,
        shotData.speed,
        shotData.distance,
        shotData.spin,
        shotData.launchAngle,
        shotData.club,
        imageBase64,
        shotData.clubBrand,
        shotData.clubModel,
        shotData.shaftType,
        shotData.shaftFlex,
        shotData.gripType,
        shotData.loftAngle,
        shotData.lieAngle,
        retailerNotes,
        fittingSessionId,
        customerEmail,
        !!customerEmail // Mark as fitting data if customer email provided
      ]);
    } else {
      // Standard consumer shot save
      result = await query(`
        INSERT INTO shots (user_id, speed, distance, spin, launch_angle, club, image_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        userId,
        shotData.speed,
        shotData.distance,
        shotData.spin,
        shotData.launchAngle,
        shotData.club,
        imageBase64
      ]);
    }

    const savedShot = result.rows[0];

    // Check for personal best
    const personalBestResult = await checkAndUpdatePersonalBest(userId, {
      id: savedShot.id,
      club: savedShot.club,
      distance: savedShot.distance,
      speed: savedShot.speed,
      spin: savedShot.spin,
      launchAngle: savedShot.launch_angle
    });

    // Return response with shot data and share URL
    const responseShot = {
      id: savedShot.id,
      speed: savedShot.speed ? parseFloat(savedShot.speed) : null,
      distance: savedShot.distance ? parseInt(savedShot.distance) : null,
      spin: savedShot.spin ? parseInt(savedShot.spin) : null,
      launchAngle: savedShot.launch_angle ? parseFloat(savedShot.launch_angle) : null,
      club: savedShot.club,
      createdAt: savedShot.created_at
    };

    // Add enhanced data for retailer responses
    if (isRetailer) {
      responseShot.enhancedData = {
        clubBrand: savedShot.club_brand,
        clubModel: savedShot.club_model,
        shaftType: savedShot.shaft_type,
        shaftFlex: savedShot.shaft_flex,
        gripType: savedShot.grip_type,
        loftAngle: savedShot.loft_angle ? parseFloat(savedShot.loft_angle) : null,
        lieAngle: savedShot.lie_angle ? parseFloat(savedShot.lie_angle) : null,
        fittingNotes: shotData.fittingNotes,
        recommendations: shotData.recommendations,
        fittingSessionId: savedShot.fitting_session_id,
        customerEmail: savedShot.customer_email,
        isFittingData: savedShot.is_fitting_data
      };
    }

    res.status(201).json({
      shot: responseShot,
      shareUrl: `/share/shot/${savedShot.id}`,
      personalBest: personalBestResult,
      accountType: user.account_type
    });

  } catch (error) {
    console.error('Shot upload error:', error);
    res.status(500).json({
      error: 'Failed to process shot',
      message: error.message
    });
  }
});

// GET /api/shots/me - Get user's shots
router.get('/me', requireJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(`
      SELECT id, speed, distance, spin, launch_angle, created_at, is_public
      FROM shots 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);

    const shots = result.rows.map(shot => ({
      id: shot.id,
      speed: shot.speed ? parseFloat(shot.speed) : null,
      distance: shot.distance ? parseInt(shot.distance) : null,
      spin: shot.spin ? parseInt(shot.spin) : null,
      launchAngle: shot.launch_angle ? parseFloat(shot.launch_angle) : null,
      createdAt: shot.created_at,
      isPublic: shot.is_public
    }));

    res.json({ shots });

  } catch (error) {
    console.error('Get user shots error:', error);
    res.status(500).json({
      error: 'Failed to fetch shots',
      message: error.message
    });
  }
});

// GET /api/shots/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all', metric = 'distance', limit = 10, club = 'all' } = req.query;
    
    // Validate metric first for security
    const validMetrics = ['distance', 'speed', 'spin'];
    const orderMetric = validMetrics.includes(metric) ? metric : 'distance';
    
    // Validate period for security
    const validPeriods = ['all', 'day', 'week'];
    const validPeriod = validPeriods.includes(period) ? period : 'all';
    
    // Build parameterized query components
    let whereConditions = [`s.${orderMetric} IS NOT NULL`];
    let queryParams = [parseInt(limit)];
    let paramIndex = 2;
    
    // Add time filter with parameters
    if (validPeriod === 'day') {
      whereConditions.push(`created_at >= NOW() - INTERVAL '1 day'`);
    } else if (validPeriod === 'week') {
      whereConditions.push(`created_at >= NOW() - INTERVAL '1 week'`);
    }
    
    // Add club filter with parameterized query
    if (club !== 'all' && club) {
      whereConditions.push(`s.club = $${paramIndex}`);
      queryParams.push(club);
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        s.id,
        s.${orderMetric} as value,
        s.speed,
        s.distance,
        s.spin,
        s.launch_angle,
        s.club,
        s.created_at,
        u.name as user_name,
        u.profile_picture as user_avatar
      FROM shots s
      JOIN users u ON s.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY s.${orderMetric} DESC
      LIMIT $1
    `, queryParams);

    const leaderboard = result.rows.map(shot => ({
      id: shot.id,
      value: shot.value ? parseFloat(shot.value) : null,
      speed: shot.speed ? parseFloat(shot.speed) : null,
      distance: shot.distance ? parseInt(shot.distance) : null,
      spin: shot.spin ? parseInt(shot.spin) : null,
      launchAngle: shot.launch_angle ? parseFloat(shot.launch_angle) : null,
      club: shot.club,
      createdAt: shot.created_at,
      user: {
        name: shot.user_name,
        avatar: shot.user_avatar
      }
    }));

    res.json({ 
      leaderboard,
      metric: orderMetric,
      period 
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      message: error.message
    });
  }
});

// PATCH /api/shots/:id/club - Update club for a shot
router.patch('/:id/club', requireJWT, async (req, res) => {
  try {
    const shotId = req.params.id;
    const userId = req.user.id;
    const { club } = req.body;

    // Verify shot ownership
    const shot = await query(
      'SELECT * FROM shots WHERE id = $1 AND user_id = $2',
      [shotId, userId]
    );

    if (shot.rows.length === 0) {
      return res.status(404).json({ error: 'Shot not found' });
    }

    // Update club
    await query(
      'UPDATE shots SET club = $1 WHERE id = $2',
      [club, shotId]
    );

    res.json({ message: 'Club updated successfully', club });

  } catch (error) {
    console.error('Update shot club error:', error);
    res.status(500).json({
      error: 'Failed to update club',
      message: error.message
    });
  }
});

// PATCH /api/shots/:id/visibility - Toggle shot visibility
router.patch('/:id/visibility', requireJWT, async (req, res) => {
  try {
    const shotId = req.params.id;
    const userId = req.user.id;
    const { isPublic } = req.body;

    // Verify shot ownership
    const shot = await query(
      'SELECT * FROM shots WHERE id = $1 AND user_id = $2',
      [shotId, userId]
    );

    if (shot.rows.length === 0) {
      return res.status(404).json({ error: 'Shot not found' });
    }

    // Update visibility
    await query(
      'UPDATE shots SET is_public = $1 WHERE id = $2',
      [isPublic, shotId]
    );

    res.json({ message: 'Shot visibility updated' });

  } catch (error) {
    console.error('Update shot visibility error:', error);
    res.status(500).json({
      error: 'Failed to update shot visibility',
      message: error.message
    });
  }
});

// DELETE /api/shots/:id - Delete shot
router.delete('/:id', requireJWT, async (req, res) => {
  try {
    const shotId = req.params.id;
    const userId = req.user.id;

    // Verify shot ownership and delete
    const result = await query(
      'DELETE FROM shots WHERE id = $1 AND user_id = $2 RETURNING id',
      [shotId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shot not found' });
    }

    res.json({ message: 'Shot deleted successfully' });

  } catch (error) {
    console.error('Delete shot error:', error);
    res.status(500).json({
      error: 'Failed to delete shot',
      message: error.message
    });
  }
});

// GET /api/shots/my-bag - Get user's personal bag with best shots by club
router.get('/my-bag', requireJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Debug: Check if personal_bests table exists and create if missing
    try {
      await query('SELECT COUNT(*) FROM personal_bests WHERE user_id = $1', [userId]);
      console.log('✅ personal_bests table exists');
    } catch (tableError) {
      console.error('❌ personal_bests table missing, creating it now...');
      try {
        // Create the table
        await query(`
          CREATE TABLE IF NOT EXISTS personal_bests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            club VARCHAR(50) NOT NULL,
            shot_id INTEGER REFERENCES shots(id) ON DELETE CASCADE,
            distance INTEGER,
            speed DECIMAL(5,1),
            spin INTEGER,
            launch_angle DECIMAL(4,1),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, club)
          )
        `);
        
        // Create indexes
        await query(`CREATE INDEX IF NOT EXISTS idx_personal_bests_user_id ON personal_bests(user_id)`);
        await query(`CREATE INDEX IF NOT EXISTS idx_personal_bests_club ON personal_bests(club)`);
        
        console.log('✅ personal_bests table created successfully');
      } catch (createError) {
        console.error('❌ Failed to create personal_bests table:', createError.message);
        return res.json({ 
          bag: [],
          stats: { totalClubs: 15, clubsWithData: 0, clubsRemaining: 15, completionPercentage: 0 },
          message: "Database setup failed. Please try again later.",
          debug: { tableExists: false, createError: createError.message }
        });
      }
    }

    // Debug: Check user's shots with clubs
    const shotsWithClubs = await query(`
      SELECT id, club, distance, speed, spin, launch_angle, created_at 
      FROM shots 
      WHERE user_id = $1 AND club IS NOT NULL
      ORDER BY created_at DESC
    `, [userId]);
    
    console.log(`📊 User ${userId} has ${shotsWithClubs.rows.length} shots with club data`);
    
    const [bag, stats] = await Promise.all([
      getUserBag(userId),
      getBagStats(userId)
    ]);

    res.json({ 
      bag,
      stats,
      message: stats.clubsWithData === 0 
        ? "Start building your bag by uploading shots with different clubs!"
        : `You've got ${stats.clubsWithData} clubs in your bag. ${stats.clubsRemaining} to go!`,
      debug: { 
        tableExists: true, 
        shotsWithClubs: shotsWithClubs.rows.length,
        recentShots: shotsWithClubs.rows.slice(0, 3)
      }
    });

  } catch (error) {
    console.error('Get my bag error:', error);
    res.status(500).json({
      error: 'Failed to fetch your bag',
      message: error.message,
      debug: { error: error.message }
    });
  }
});

module.exports = router; 