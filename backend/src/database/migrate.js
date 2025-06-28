const { query } = require('./db');

const createTables = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create shots table
    await query(`
      CREATE TABLE IF NOT EXISTS shots (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        speed DECIMAL(5,1),
        distance INTEGER,
        spin INTEGER,
        launch_angle DECIMAL(4,1),
        image_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Shots table created');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_user_id ON shots(user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_created_at ON shots(created_at DESC);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_distance ON shots(distance DESC);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables();
}

// Don't exit when called from server
const createTablesNoExit = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create shots table
    await query(`
      CREATE TABLE IF NOT EXISTS shots (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        speed DECIMAL(5,1),
        distance INTEGER,
        spin INTEGER,
        launch_angle DECIMAL(4,1),
        image_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT false
      )
    `);
    console.log('✅ Shots table created');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_user_id ON shots(user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_created_at ON shots(created_at DESC);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_distance ON shots(distance DESC);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Database migration completed successfully!');
    // Add admin column to users table (safe if already exists)
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `);
    console.log('✅ Admin column added');

    // Add club column to shots table
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS club VARCHAR(50);
    `);
    console.log('✅ Club column added');

    // Set samkim@samkim.com as admin
    await query(`
      UPDATE users 
      SET is_admin = true 
      WHERE email = 'samkim@samkim.com';
    `);
    console.log('✅ Admin user configured');

    // Create personal_bests table for "My Bag" tracking
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
    console.log('✅ Personal bests table created');

    // Create indexes for personal bests
    await query(`
      CREATE INDEX IF NOT EXISTS idx_personal_bests_user_id ON personal_bests(user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_personal_bests_club ON personal_bests(club);
    `);
    console.log('✅ Personal bests indexes created');

    // ==========================================
    // 🚀 NEW RETAILER FEATURES - PHASE 2
    // ==========================================

    // Add retailer fields to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'consumer';
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS retailer_business_name VARCHAR(255);
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS retailer_location VARCHAR(255);
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none';
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50);
    `);
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS daily_shot_limit INTEGER DEFAULT 10;
    `);
    console.log('✅ Retailer user fields added');

    // Enhanced shot data for retailers
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS club_brand VARCHAR(100);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS club_model VARCHAR(100);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS shaft_type VARCHAR(100);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS shaft_flex VARCHAR(20);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS grip_type VARCHAR(100);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS loft_angle DECIMAL(4,1);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS lie_angle DECIMAL(4,1);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS retailer_notes TEXT;
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS fitting_session_id VARCHAR(100);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
    `);
    await query(`
      ALTER TABLE shots 
      ADD COLUMN IF NOT EXISTS is_fitting_data BOOLEAN DEFAULT false;
    `);
    console.log('✅ Enhanced shot data fields added');

    // Create retailer_customers table for lead tracking
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

    // Create indexes for retailer features
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_retailer_session ON shots(fitting_session_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shots_customer_email ON shots(customer_email);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_retailer_customers_retailer ON retailer_customers(retailer_user_id);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_fitting_sessions_retailer ON fitting_sessions(retailer_user_id);
    `);
    console.log('✅ Retailer indexes created');

    console.log('🎉 RETAILER FEATURES MIGRATION COMPLETED! 🚀');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

module.exports = { createTables, createTablesNoExit }; 