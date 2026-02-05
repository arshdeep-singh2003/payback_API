const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Clear any system DATABASE_URL before loading .env
delete process.env.DATABASE_URL;

// Now load from .env file
require('dotenv').config();

async function initializeDatabase() {
  console.log('🔄 Initializing PayBack Database');
  console.log('==================================');
  
  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file!');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('❌ DATABASE_URL must start with postgresql://');
    console.error('   Current value:', process.env.DATABASE_URL);
    process.exit(1);
  }
  
  // Render databases ALWAYS require SSL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected successfully!');
    console.log(`   Server time: ${result.rows[0].current_time}`);
    console.log('');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Executing schema...');
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('');
    console.log('📋 Tables created:');
    console.log('   - Users');
    console.log('   - IOURecords');
    console.log('   - Payments');
    console.log('');
    console.log('💡 You can now start the server with: npm start');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env file');
    console.error('   2. Make sure it includes the full Render hostname');
    console.error('   3. Verify the database exists on Render');
    console.error('   4. Check that your Render database is running');
    
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
