const express = require('express');
const bcrypt = require('bcryptjs'); // 📌 Şifre hashleme için eklendi
const User = require('../models/user');
const Physio = require('../models/physio'); // 📌 Model yolu küçük harf uyumu
const Support = require('../models/support'); // 📌 Model yolu küçük harf uyumu
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// 📌 Admin - Kullanıcıları listele
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Admin - Yeni kullanıcı ekle
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { phone, password, name, role } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: 'Telefon ve şifre zorunludur' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı' });
        }

        // 📌 Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            phone,
            password: hashedPassword,
            name,
            role: role || 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'Kullanıcı başarıyla eklendi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Admin - Kullanıcı sil
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Kullanıcı silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Admin - Kullanıcı rolünü güncelle
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: 'Kullanıcı rolü güncellendi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Admin - Tüm fizyolojik verileri listele
router.get('/physio', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const physioData = await Physio.find();
        res.json(physioData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Admin - Tüm destek mesajlarını listele
router.get('/support', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const supportData = await Support.find();
        res.json(supportData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
