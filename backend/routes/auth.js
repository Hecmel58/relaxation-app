const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 📌 Kullanıcı Kaydı
router.post('/register', async (req, res) => {
    try {
        const { phone, password, name, role } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: 'Telefon ve şifre zorunludur' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            phone,
            password: hashedPassword,
            name: name || '',
            role: role || 'user'
        });

        await newUser.save();

        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
});

// 📌 Kullanıcı Girişi - TUTARLI TOKEN YAPISI
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: 'Telefon ve şifre zorunludur' });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Geçersiz şifre' });
        }

        // 🔥 DOĞRU TOKEN PAYLOAD - Rol bilgisi eklendi
        const token = jwt.sign(
            { 
                id: user._id,
                phone: user.phone,
                role: user.role,  // 👈 Bu çok önemli!
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('🚀 Login başarılı:', { phone: user.phone, role: user.role }); // Debug log

        res.json({
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                role: user.role // 👈 Bu da önemli!
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// 📌 Kullanıcı Profili
router.get('/me', authenticate, async (req, res) => {
    try {
        console.log('👤 User from token:', req.user); // Debug log
        res.json(req.user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;