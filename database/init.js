const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

delete process.env.DATABASE_URL;
require('dotenv').config();

async function initializeDatabase() {
  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in .env file');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('Error: DATABASE_URL must start with postgresql://');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await pool.query('SELECT NOW()');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database initialized successfully');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
