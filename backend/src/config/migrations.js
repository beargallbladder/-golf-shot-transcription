const { query } = require('../database/db');

const migrations = [
  {
    version: 'v1_add_retailer_user_fields',
    description: 'Add retailer fields to users table',
    up: async () => {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'consumer'`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS retailer_business_name VARCHAR(255)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS retailer_location VARCHAR(255)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none'`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_shot_limit INTEGER DEFAULT 10`);
      await query(`CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type)`);
    }
  },
  {
    version: 'v2_add_retailer_shot_fields',
    description: 'Add enhanced shot data fields for retailers',
    up: async () => {
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS club_brand VARCHAR(100)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS club_model VARCHAR(100)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS shaft_type VARCHAR(100)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS shaft_flex VARCHAR(20)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS grip_type VARCHAR(100)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS loft_angle DECIMAL(4,1)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS lie_angle DECIMAL(4,1)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS retailer_notes TEXT`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS fitting_session_id VARCHAR(100)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await query(`ALTER TABLE shots ADD COLUMN IF NOT EXISTS is_fitting_data BOOLEAN DEFAULT false`);
      await query(`CREATE INDEX IF NOT EXISTS idx_shots_retailer_session ON shots(fitting_session_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_shots_customer_email ON shots(customer_email)`);
    }
  },
  {
    version: 'v3_create_retailer_tables',
    description: 'Create retailer customer and fitting session tables',
    up: async () => {
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

      await query(`
        CREATE TABLE IF NOT EXISTS migration_history (
          id SERIAL PRIMARY KEY,
          version VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await query(`CREATE INDEX IF NOT EXISTS idx_retailer_customers_retailer ON retailer_customers(retailer_user_id)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_fitting_sessions_retailer ON fitting_sessions(retailer_user_id)`);
    }
  },
  {
    version: 'v4_add_performance_indexes',
    description: 'Add critical performance indexes for query optimization',
    up: async () => {
      console.log('📊 Adding performance indexes...');
      
      // Critical index for daily shot limit queries
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_user_created_date ON shots(user_id, created_at)`);
      
      // Indexes for leaderboard queries with partial indexes for better performance
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_distance_desc_not_null ON shots(distance DESC) WHERE distance IS NOT NULL`);
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_speed_desc_not_null ON shots(speed DESC) WHERE speed IS NOT NULL`);
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_spin_desc_not_null ON shots(spin DESC) WHERE spin IS NOT NULL`);
      
      // Composite indexes for retailer analytics
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_retailer_analytics ON shots(user_id, is_fitting_data, created_at)`);
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_customer_analytics ON shots(user_id, customer_email, created_at) WHERE customer_email IS NOT NULL`);
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_fitting_session_analytics ON shots(user_id, fitting_session_id, created_at) WHERE fitting_session_id IS NOT NULL`);
      
      // Index for club-based queries (My Bag feature)
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_user_club_distance ON shots(user_id, club, distance DESC) WHERE club IS NOT NULL`);
      
      // Index for personal bests queries
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_personal_bests_comprehensive ON personal_bests(user_id, club, distance DESC)`);
      
      // Index for user authentication queries
      await query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))`);
      
      console.log('✅ Performance indexes added successfully');
    }
  }
];

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Ensure migration_history table exists first
    await query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        version VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of migrations) {
      // Check if migration already applied
      const result = await query(
        'SELECT version FROM migration_history WHERE version = $1',
        [migration.version]
      );

      if (result.rows.length === 0) {
        console.log(`📦 Applying migration: ${migration.version}`);
        await migration.up();
        
        // Record migration as applied
        await query(
          'INSERT INTO migration_history (version, description) VALUES ($1, $2)',
          [migration.version, migration.description]
        );
        
        console.log(`✅ Migration completed: ${migration.version}`);
      } else {
        console.log(`⏭️ Migration already applied: ${migration.version}`);
      }
    }

    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

module.exports = { runMigrations }; 