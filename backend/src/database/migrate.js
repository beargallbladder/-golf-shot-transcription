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

module.exports = { createTables }; 