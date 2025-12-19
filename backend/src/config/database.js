const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000, // 30 saniye - Neon cold start için
  statement_timeout: 30000,
  query_timeout: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Retry mantığı ile sorgu çalıştırma
const queryWithRetry = async (text, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error(`Database query attempt ${i + 1} failed:`, err.message);
      
      // Son deneme değilse ve bağlantı hatası ise bekle ve tekrar dene
      if (i < retries - 1 && (
        err.message.includes('timeout') || 
        err.message.includes('connection') ||
        err.message.includes('terminated') ||
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT'
      )) {
        console.log(`Retrying in ${(i + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
        continue;
      }
      throw err;
    }
  }
};

// Test connection with retry
const testConnection = async () => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
      return true;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, err.message);
      if (i < 2) {
        console.log('Retrying connection in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  console.error('❌ All database connection attempts failed');
  return false;
};

// Initial connection test
testConnection();

// Export both pool and retry function
module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;
