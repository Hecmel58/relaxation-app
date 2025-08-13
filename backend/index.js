require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const meditationRoutes = require('./routes/meditations');
const journalRoutes = require('./routes/journals');

const app = express();

// CORS — Cloudflare Pages ve lokal geliştirme izinli
const allowedOrigins = [
    'https://relaxation-app.pages.dev',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin(origin, cb) {
        // Postman/cihaz içi istekler için origin yoksa izin ver
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked: ' + origin));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false
}));
app.options('*', cors());

// Body parser
app.use(express.json());

// Sağlık + kök
app.get('/', (req, res) => {
    res.status(200).json({ ok: true, message: 'Relaxation API up' });
});
app.get('/api/health', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/journals', journalRoutes);

// Mongo bağlantı
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'relaxation_db';

mongoose.set('strictQuery', true);
mongoose.connect(MONGO_URI, {
    dbName: MONGO_DBNAME
})
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch(err => {
        console.error('❌ MongoDB bağlantı hatası:', err?.message || err);
        process.exit(1);
    });

// Render için doğru port
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
