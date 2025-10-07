require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./src/routes');
const heartRateRoutes = require('./src/routes/heartRateRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');
const { RATE_LIMIT } = require('./src/config/constants');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fidbal.com',
    'https://www.fidbal.com',
    'https://fidbal-backend.vercel.app'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: { success: false, error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/health')
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX,
  message: { success: false, error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.phone || req.ip,
  skipSuccessfulRequests: true
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FidBal Backend API v2.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      sleep: '/api/sleep',
      forms: '/api/forms',
      admin: '/api/admin',
      heartRate: '/api/heart-rate'
    }
  });
});

app.use('/api', routes);
app.use('/api/heart-rate', heartRateRoutes);
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`FidBal Backend API v2.0 running on port ${PORT}`);
  });
}

module.exports = app;