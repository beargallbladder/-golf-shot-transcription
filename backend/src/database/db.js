const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('📊 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Helper function to execute queries with performance monitoring
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Performance monitoring with environment-based logging
    const logQuery = process.env.NODE_ENV === 'development' || process.env.LOG_QUERIES === 'true';
    const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000; // 1 second default
    
    if (duration > slowQueryThreshold) {
      console.warn('🐌 SLOW QUERY DETECTED:', { 
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`, 
        rows: res.rowCount,
        params: params ? `${params.length} params` : 'no params'
      });
    } else if (logQuery) {
      console.log('📝 Query executed:', { 
        query: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        duration: `${duration}ms`, 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', {
      error: error.message,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params: params ? `${params.length} params` : 'no params'
    });
    throw error;
  }
};

// Helper function to get a client from the pool
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  getClient,
  pool
}; 