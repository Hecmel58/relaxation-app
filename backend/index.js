require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler');
const { RATE_LIMIT } = require('./src/config/constants');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    logger.error(`FATAL: ${varName} is not defined`);
    process.exit(1);
  }
});

if (process.env.JWT_SECRET.length < 32) {
  logger.error('FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fidbal.com',
  'https://www.fidbal.com',
  'https://fidbal-backend.vercel.app',
  'https://relaxation-app.pages.dev'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('pages.dev') || origin.includes('cloudflare')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: 1000,
  message: { success: false, error: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.includes('/health') || req.path.includes('/chat/unread-count')
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: 50,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.phone || req.ip,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Phone: ${req.body.phone || 'N/A'}`);
    res.status(429).json({
      success: false,
      error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
    });
  }
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
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`FidBal Backend API v2.0 running on port ${PORT}`);
  });
}

module.exports = app;