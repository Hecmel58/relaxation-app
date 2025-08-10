const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 📌 .env değişkenleri kontrolü
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('❌ MONGO_URI veya JWT_SECRET .env dosyasında tanımlı değil!');
    process.exit(1);
}

// 📌 Middleware
app.use(cors());
app.use(express.json());

// 📌 MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch(err => {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
        process.exit(1);
    });

// 📌 Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/journals', require('./routes/journals'));
app.use('/api/meditations', require('./routes/meditations'));
app.use('/api/physio', require('./routes/physio'));
app.use('/api/support', require('./routes/support'));

// 📌 404 Hata Yakalama
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// 📌 Global Hata Yakalama Middleware
app.use((err, req, res, next) => {
    console.error('🚨 Sunucu hatası:', err.stack);
    res.status(500).json({ message: 'Sunucu hatası', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor`));
