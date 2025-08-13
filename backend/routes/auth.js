const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name = '' } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ error: 'Bu email zaten kayıtlı' });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hash, name });

        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, name: user.name } });
    } catch (e) {
        res.status(500).json({ error: 'Kayıt başarısız', detail: e?.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Geçersiz bilgiler' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Geçersiz bilgiler' });

        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email, name: user.name } });
    } catch (e) {
        res.status(500).json({ error: 'Giriş başarısız', detail: e?.message });
    }
});

// Me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean();
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        res.json({ id: user._id, email: user.email, name: user.name });
    } catch (e) {
        res.status(500).json({ error: 'Hata', detail: e?.message });
    }
});

module.exports = router;
