const { Pool } = require('pg');
require('dotenv').config();

// Neon serverless için optimize edilmiş ayarlar
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 60000,
  statement_timeout: 60000,
  query_timeout: 60000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

pool.on('connect', () => {
  console.log('New database connection established');
});

// Retry mantigi ile sorgu calistirma
const queryWithRetry = async (text, params, retries = 5) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      lastError = err;
      console.error(`Database query attempt ${i + 1}/${retries} failed:`, err.message);
      
      // Baglanti hatasi kontrolu
      const isConnectionError = 
        err.message.includes('timeout') || 
        err.message.includes('connection') ||
        err.message.includes('terminated') ||
        err.message.includes('ECONNRESET') ||
        err.message.includes('ETIMEDOUT') ||
        err.message.includes('Connection terminated') ||
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === '57P01' ||
        err.code === '57P02' ||
        err.code === '57P03';
      
      // Son deneme degilse ve baglanti hatasi ise bekle ve tekrar dene
      if (i < retries - 1 && isConnectionError) {
        const waitTime = Math.min((i + 1) * 2000, 10000);
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

// Test connection with retry
const testConnection = async () => {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('Database connected successfully');
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1}/5 failed:`, err.message);
      if (i < 4) {
        const waitTime = (i + 1) * 3000;
        console.log(`Retrying connection in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  console.error('All database connection attempts failed');
  return false;
};

// Initial connection test
testConnection();

// Export both pool and retry function
module.exports = pool;
module.exports.queryWithRetry = queryWithRetry;
