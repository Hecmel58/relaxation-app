const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10 saniye (önceki: 2 saniye)
  statement_timeout: 30000,
  query_timeout: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Test connection (async)
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

module.exports = pool;