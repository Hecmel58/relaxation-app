const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Neon Serverless Driver - HTTP tabanlı, TCP cold start yok
const sql = neon(process.env.DATABASE_URL);

console.log('Using Neon Serverless Driver (HTTP-based)');

// Pool benzeri interface - mevcut kodla uyumlu
const pool = {
  // Ana query metodu
  query: async (text, params) => {
    try {
      let result;
      if (params && params.length > 0) {
        result = await sql.unsafe(text, params);
      } else {
        result = await sql.unsafe(text);
      }
      return { 
        rows: Array.isArray(result) ? result : [result], 
        rowCount: Array.isArray(result) ? result.length : 1 
      };
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  },

  // Connect metodu - uyumluluk için
  connect: async () => {
    return {
      query: pool.query,
      release: () => {}
    };
  },

  // Event handlers - uyumluluk için
  on: (event, handler) => {
    // Neon serverless'ta event'ler kullanılmaz
  }
};

// Retry mantığı ile query
const queryWithRetry = async (text, params, retries = 3) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      lastError = err;
      console.error(`Query attempt ${i + 1}/${retries} failed:`, err.message);
      
      if (i < retries - 1) {
        const waitTime = (i + 1) * 1000;
        console.log(`Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  throw lastError;
};

// Test connection
const testConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log('Database connected successfully (Neon Serverless HTTP)');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return false;
  }
};

testConnection();

// Export - pool olarak export et (mevcut kodla uyumlu)
module.exports = pool;
module.exports.query = pool.query;
module.exports.queryWithRetry = queryWithRetry;