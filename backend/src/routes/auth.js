const express = require('express');
const passport = require('passport');
const { generateJWT, requireJWT } = require('../middleware/auth');
const { query } = require('../database/db');

const router = express.Router();

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    console.log('🔄 OAuth callback hit, attempting authentication...');
    
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed` 
    })(req, res, (err) => {
      if (err) {
        console.error('❌ OAuth authentication error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_error&details=${encodeURIComponent(err.message)}`);
      }
      
      if (!req.user) {
        console.error('❌ No user object after authentication');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=no_user`);
      }
      
      try {
        console.log('✅ User authenticated:', req.user.email);
        
        // Generate JWT token for the authenticated user
        const token = generateJWT(req.user.id);
        console.log('✅ JWT token generated for user ID:', req.user.id);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
        console.log('🔄 Redirecting to:', redirectUrl);
        
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Token generation error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=token_error&details=${encodeURIComponent(error.message)}`);
      }
    });
  }
);

// Get current user info
router.get('/me', requireJWT, async (req, res) => {
  try {
    // Get full user data including retailer fields
    const userResult = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profile_picture,
        accountType: user.account_type || 'consumer',
        isAdmin: user.is_admin || false,
        retailerInfo: user.account_type === 'retailer' ? {
          businessName: user.retailer_business_name,
          location: user.retailer_location,
          subscriptionStatus: user.subscription_status,
          subscriptionPlan: user.subscription_plan,
          dailyLimit: user.daily_shot_limit
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// ==========================================
// 🚀 RETAILER UPGRADE ENDPOINTS
// ==========================================

// Retailer whitelist - ONLY these emails can access retailer features
const RETAILER_WHITELIST = [
  'samkim@samkim.com',
  // FIRST CUSTOMER - Fairway Golf USA (San Diego)
  'info@fairwaygolfusa.com',
  'sales@fairwaygolfusa.com',
  'custom@fairwaygolfusa.com',
  // Add more beta retailers here when ready to expand
];

// Check if user is whitelisted for retailer features
const isRetailerWhitelisted = (email) => {
  return RETAILER_WHITELIST.includes(email.toLowerCase());
};

// Get retailer upgrade pricing
router.get('/retailer/pricing', requireJWT, (req, res) => {
  // Check if user is whitelisted for retailer features
  if (!isRetailerWhitelisted(req.user.email)) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: 'Retailer features are currently in private beta. Contact support@beatmybag.com for access.' 
    });
  }

  res.json({
    plans: [
      {
        id: 'small_shop_basic',
        name: 'Small Shop Basic',
        price: 39,
        interval: 'month',
        features: [
          'Enhanced AI transcription with club specs',
          'Customer sharing with your branding',
          '100 shots per month',
          'Basic lead capture',
          'Email support'
        ],
        recommended: false
      },
      {
        id: 'small_shop_pro',
        name: 'Small Shop Pro',
        price: 99,
        interval: 'month',
        features: [
          'Everything in Basic',
          'Unlimited shots',
          'Multi-language support (English, Spanish, Japanese)',
          'Advanced lead capture & follow-up automation',
          'Professional fitting documentation',
          'Customer import to personal accounts',
          'Priority support'
        ],
        recommended: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Custom',
        interval: 'month',
        features: [
          'Everything in Pro',
          'Corporate dashboard for chains',
          'Commission tracking for sales staff',
          'White-label branding',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ],
        recommended: false
      }
    ]
  });
});

// Start retailer upgrade process
router.post('/retailer/upgrade', requireJWT, async (req, res) => {
  try {
    // Check if user is whitelisted for retailer features
    if (!isRetailerWhitelisted(req.user.email)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Retailer features are currently in private beta. Contact support@beatmybag.com for access.' 
      });
    }

    const { plan, businessName, location } = req.body;
    const userId = req.user.id;

    // Validate plan
    const validPlans = ['small_shop_basic', 'small_shop_pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Update user to retailer account type
    await query(`
      UPDATE users 
      SET 
        account_type = 'retailer',
        retailer_business_name = $1,
        retailer_location = $2,
        subscription_plan = $3,
        subscription_status = 'pending',
        daily_shot_limit = CASE 
          WHEN $3 = 'small_shop_basic' THEN 100
          WHEN $3 = 'small_shop_pro' THEN 999999
          ELSE 999999
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [businessName, location, plan, userId]);

    console.log(`🎉 RETAILER UPGRADE: ${req.user.email} upgraded to ${plan}`);

    // For now, return placeholder Stripe info
    // TODO: Integrate with actual Stripe when ready
    res.json({
      success: true,
      message: 'Retailer upgrade initiated',
      plan: plan,
      status: 'pending',
      nextSteps: {
        payment: 'PLACEHOLDER - Stripe integration coming soon',
        setupGuide: 'Check your email for setup instructions',
        support: 'Contact support@beatmybag.com for assistance'
      },
      // Placeholder pricing
      pricing: {
        small_shop_basic: { monthly: 39, description: 'Basic retailer features' },
        small_shop_pro: { monthly: 99, description: 'Full retailer suite' },
        enterprise: { monthly: 'custom', description: 'Contact sales' }
      }
    });

  } catch (error) {
    console.error('❌ Retailer upgrade error:', error);
    res.status(500).json({ error: 'Failed to process upgrade request' });
  }
});

// Get retailer dashboard data
router.get('/retailer/dashboard', requireJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is whitelisted for retailer features
    if (!isRetailerWhitelisted(req.user.email)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Retailer features are currently in private beta.' 
      });
    }

    // Verify user is a retailer
    const userResult = await query('SELECT account_type FROM users WHERE id = $1', [userId]);
    if (userResult.rows[0]?.account_type !== 'retailer') {
      return res.status(403).json({ error: 'Access denied - retailer account required' });
    }

    // Get retailer stats
    const [shotsResult, customersResult, sessionsResult] = await Promise.all([
      query(`
        SELECT COUNT(*) as total_shots,
               COUNT(CASE WHEN is_fitting_data = true THEN 1 END) as fitting_shots,
               COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as shots_this_month
        FROM shots WHERE user_id = $1
      `, [userId]),
      query(`
        SELECT COUNT(*) as total_customers,
               COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_customers
        FROM retailer_customers WHERE retailer_user_id = $1
      `, [userId]),
      query(`
        SELECT COUNT(*) as total_sessions,
               COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions
        FROM fitting_sessions WHERE retailer_user_id = $1
      `, [userId])
    ]);

    res.json({
      stats: {
        totalShots: parseInt(shotsResult.rows[0].total_shots),
        fittingShots: parseInt(shotsResult.rows[0].fitting_shots),
        shotsThisMonth: parseInt(shotsResult.rows[0].shots_this_month),
        totalCustomers: parseInt(customersResult.rows[0].total_customers),
        newCustomers: parseInt(customersResult.rows[0].new_customers),
        totalSessions: parseInt(sessionsResult.rows[0].total_sessions),
        activeSessions: parseInt(sessionsResult.rows[0].active_sessions)
      }
    });

  } catch (error) {
    console.error('❌ Retailer dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Generate JWT token for authenticated session user
router.post('/token', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const token = generateJWT(req.user.id);
  res.json({ token });
});

// Debug endpoint to check environment variables
router.get('/debug/env', (req, res) => {
  res.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV,
    // Show actual client ID (last 15 chars for debugging)
    clientIdSuffix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(-15) : 'NOT_SET',
    // Show first 15 chars too
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(0, 15) : 'NOT_SET'
  });
});

// Debug endpoint to manually trigger database migration
router.get('/debug/migrate', async (req, res) => {
  try {
    console.log('🔄 Manual migration triggered...');
    
    // Add retailer fields to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'consumer'
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS retailer_business_name VARCHAR(255)
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS retailer_location VARCHAR(255)
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none'
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50)
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS daily_shot_limit INTEGER DEFAULT 10
    `);
    console.log('✅ User table retailer fields added');

    // Enhanced shot data for retailers
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS club_brand VARCHAR(100)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS club_model VARCHAR(100)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS shaft_type VARCHAR(100)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS shaft_flex VARCHAR(20)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS grip_type VARCHAR(100)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS loft_angle DECIMAL(4,1)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS lie_angle DECIMAL(4,1)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS retailer_notes TEXT
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS fitting_session_id VARCHAR(100)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS is_fitting_data BOOLEAN DEFAULT false
    `);
    console.log('✅ Shots table enhanced fields added');

    // Create retailer_customers table
    await query(`
      CREATE TABLE IF NOT EXISTS retailer_customers (
        id SERIAL PRIMARY KEY,
        retailer_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        fitting_session_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'prospect',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(retailer_user_id, customer_email)
      )
    `);
    console.log('✅ Retailer customers table created');

    // Create fitting_sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS fitting_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) UNIQUE NOT NULL,
        retailer_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_notes TEXT,
        recommended_clubs JSONB,
        status VARCHAR(50) DEFAULT 'active',
        share_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Fitting sessions table created');

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_shots_retailer_session ON shots(fitting_session_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_shots_customer_email ON shots(customer_email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_retailer_customers_retailer ON retailer_customers(retailer_user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_fitting_sessions_retailer ON fitting_sessions(retailer_user_id)`);
    console.log('✅ Retailer indexes created');

    res.json({
      success: true,
      message: 'Database migration completed successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Manual migration failed:', error);
    res.status(500).json({
      error: 'Migration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 