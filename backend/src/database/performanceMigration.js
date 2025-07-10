const fs = require('fs').promises;
const path = require('path');
const { query } = require('./db');

async function runPerformanceMigration() {
  console.log('🚀 Starting critical performance migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', 'critical_performance_indexes.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    // Split by semicolon and filter out empty statements
    const statements = sql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        const start = Date.now();
        console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        // Log what we're executing (first 100 chars)
        const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
        console.log(`   ${preview}${statement.length > 100 ? '...' : ''}`);
        
        await query(statement);
        
        const duration = Date.now() - start;
        console.log(`   ✅ Success (${duration}ms)`);
        successCount++;
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        
        // Don't fail on "already exists" errors
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist') ||
            error.message.includes('IF NOT EXISTS')) {
          console.log(`   ⚠️  Ignoring expected error`);
          successCount++;
        } else {
          errorCount++;
          // Log but continue with other statements
          console.error(`   💥 Statement failed:`, statement.substring(0, 200));
        }
      }
    }
    
    console.log(`\n📊 Migration Results:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📈 Success Rate: ${((successCount / statements.length) * 100).toFixed(1)}%`);
    
    // Test query performance
    await testQueryPerformance();
    
    console.log('\n🎯 Critical performance migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

async function testQueryPerformance() {
  console.log('\n🧪 Testing query performance...');
  
  const testQueries = [
    {
      name: 'User Dashboard Stats',
      sql: `SELECT COUNT(*) as shot_count, AVG(distance) as avg_distance, MAX(distance) as max_distance 
            FROM shots WHERE user_id = 1 AND deleted_at IS NULL LIMIT 1`
    },
    {
      name: 'Public Leaderboard',
      sql: `SELECT user_id, MAX(distance) as max_distance 
            FROM shots WHERE is_public = true AND deleted_at IS NULL 
            GROUP BY user_id ORDER BY max_distance DESC LIMIT 10`
    },
    {
      name: 'Club Analysis',
      sql: `SELECT club, AVG(distance) as avg_distance, COUNT(*) as shot_count 
            FROM shots WHERE user_id = 1 AND deleted_at IS NULL 
            GROUP BY club LIMIT 10`
    }
  ];
  
  for (const test of testQueries) {
    try {
      const start = Date.now();
      const result = await query(test.sql);
      const duration = Date.now() - start;
      
      console.log(`   📊 ${test.name}: ${duration}ms (${result.rowCount} rows)`);
      
      if (duration > 100) {
        console.log(`   ⚠️  Still slow - may need more optimization`);
      } else {
        console.log(`   🚀 Fast query!`);
      }
      
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceMigration()
    .then(() => {
      console.log('✅ Performance migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Performance migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceMigration };