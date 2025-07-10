const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('./email'); // You'll need to implement this
const db = require('../database/db');

class RetailerActivationService {
  // Whitelist of approved retailer email domains for initial launch
  static APPROVED_DOMAINS = [
    'golfgalaxy.com',
    'pga-tour-superstore.com',
    'tgw.com',
    'golfdiscount.com',
    // Add your first retailer domain here
  ];

  // Check if email domain is whitelisted
  static isApprovedDomain(email) {
    const domain = email.split('@')[1];
    return this.APPROVED_DOMAINS.includes(domain);
  }

  // Generate secure activation token
  static generateActivationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create retailer activation request
  static async createActivation(email, companyName, contactName) {
    // Validate email domain
    if (!this.isApprovedDomain(email)) {
      throw new Error('Your email domain is not yet approved for retailer access. Please contact support.');
    }

    // Check if activation already exists
    const existing = await db.query(
      'SELECT * FROM retailer_activations WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      const activation = existing.rows[0];
      if (activation.is_activated) {
        throw new Error('This email is already activated');
      }
      // Resend activation email
      await this.sendActivationEmail(email, activation.token);
      return { message: 'Activation email resent' };
    }

    // Create new activation
    const token = this.generateActivationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.query(
      `INSERT INTO retailer_activations 
       (email, company_name, contact_name, token, expires_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [email, companyName, contactName, token, expiresAt]
    );

    // Send activation email
    await this.sendActivationEmail(email, token);

    return { message: 'Activation email sent' };
  }

  // Send activation email
  static async sendActivationEmail(email, token) {
    const activationUrl = `${process.env.FRONTEND_URL}/retailer/activate?token=${token}`;
    
    const emailContent = {
      to: email,
      subject: 'Activate Your GolfSimple Retailer Account',
      html: `
        <h2>Welcome to GolfSimple Retailer Platform!</h2>
        <p>You're just one click away from accessing powerful golf analytics and customer insights.</p>
        <p>Click the link below to activate your account:</p>
        <a href="${activationUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #52B788;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        ">Activate Retailer Account</a>
        <p>This link will expire in 24 hours.</p>
        <h3>What you'll get access to:</h3>
        <ul>
          <li>Real-time customer golf analytics</li>
          <li>Equipment usage trends</li>
          <li>Local player insights</li>
          <li>Inventory optimization recommendations</li>
          <li>Customer engagement tools</li>
        </ul>
        <p>If you didn't request this activation, please ignore this email.</p>
      `
    };

    await sendEmail(emailContent);
  }

  // Verify activation token
  static async verifyActivation(token) {
    const result = await db.query(
      `SELECT * FROM retailer_activations 
       WHERE token = $1 AND expires_at > NOW() AND is_activated = false`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired activation token');
    }

    const activation = result.rows[0];

    // Create retailer account
    const retailer = await this.createRetailerAccount(activation);

    // Mark activation as complete
    await db.query(
      'UPDATE retailer_activations SET is_activated = true WHERE id = $1',
      [activation.id]
    );

    return retailer;
  }

  // Create retailer account from activation
  static async createRetailerAccount(activation) {
    // Create user account with retailer role
    const result = await db.query(
      `INSERT INTO users 
       (email, name, role, is_retailer, company_name) 
       VALUES ($1, $2, 'retailer', true, $3)
       RETURNING *`,
      [activation.email, activation.contact_name, activation.company_name]
    );

    const user = result.rows[0];

    // Create retailer profile
    await db.query(
      `INSERT INTO retailer_profiles 
       (user_id, company_name, subscription_tier, features_enabled) 
       VALUES ($1, $2, $3, $4)`,
      [
        user.id,
        activation.company_name,
        'basic', // Start with basic tier
        JSON.stringify({
          analytics: true,
          reports: true,
          customer_insights: false,
          api_access: false,
          white_label: false
        })
      ]
    );

    // Generate JWT token for immediate login
    const jwtToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: 'retailer',
        isRetailer: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user,
      token: jwtToken,
      message: 'Retailer account activated successfully'
    };
  }

  // Upgrade retailer tier
  static async upgradeRetailer(userId, tier) {
    const tiers = {
      basic: {
        analytics: true,
        reports: true,
        customer_insights: false,
        api_access: false,
        white_label: false
      },
      pro: {
        analytics: true,
        reports: true,
        customer_insights: true,
        inventory_sync: true,
        api_access: false,
        white_label: false
      },
      enterprise: {
        analytics: true,
        reports: true,
        customer_insights: true,
        inventory_sync: true,
        api_access: true,
        white_label: true,
        custom_branding: true
      }
    };

    if (!tiers[tier]) {
      throw new Error('Invalid tier');
    }

    await db.query(
      `UPDATE retailer_profiles 
       SET subscription_tier = $1, features_enabled = $2 
       WHERE user_id = $3`,
      [tier, JSON.stringify(tiers[tier]), userId]
    );

    return { message: 'Retailer tier upgraded successfully' };
  }

  // Get retailer analytics
  static async getRetailerAnalytics(userId) {
    // Get retailer's location/region
    const retailerInfo = await db.query(
      'SELECT * FROM retailer_profiles WHERE user_id = $1',
      [userId]
    );

    if (retailerInfo.rows.length === 0) {
      throw new Error('Retailer profile not found');
    }

    // Get local player statistics
    const analytics = await db.query(
      `SELECT 
        COUNT(DISTINCT s.user_id) as total_players,
        COUNT(s.id) as total_shots,
        AVG(s.distance) as avg_distance,
        MAX(s.distance) as max_distance,
        s.club,
        COUNT(s.id) as shots_per_club
       FROM shots s
       JOIN users u ON s.user_id = u.id
       WHERE s.created_at > NOW() - INTERVAL '30 days'
       GROUP BY s.club
       ORDER BY shots_per_club DESC`,
      []
    );

    // Get trending equipment
    const trending = await db.query(
      `SELECT 
        club,
        COUNT(*) as usage_count,
        AVG(distance) as avg_distance,
        STDDEV(distance) as consistency
       FROM shots
       WHERE created_at > NOW() - INTERVAL '7 days'
       GROUP BY club
       ORDER BY usage_count DESC
       LIMIT 10`,
      []
    );

    return {
      overview: {
        totalPlayers: analytics.rows.reduce((acc, row) => Math.max(acc, row.total_players), 0),
        totalShots: analytics.rows.reduce((acc, row) => acc + parseInt(row.total_shots), 0),
        avgDistance: analytics.rows.reduce((acc, row) => acc + parseFloat(row.avg_distance), 0) / analytics.rows.length
      },
      clubUsage: analytics.rows,
      trending: trending.rows,
      generatedAt: new Date()
    };
  }
}

module.exports = RetailerActivationService;