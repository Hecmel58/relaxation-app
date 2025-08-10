const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // 📌 Küçük harf uyumu
const authMiddleware = require('../middleware/authMiddleware'); // 📌 Ortak token doğrulama

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            phone,
            password: hashedPassword,
            name: name || '',
            role: role || 'user'
        });

        await newUser.save();

        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Kullanıcı Girişi
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

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Kullanıcı Bilgisi - Token ile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
