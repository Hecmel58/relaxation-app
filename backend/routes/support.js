const express = require('express');
const Support = require('../models/support'); // 📌 küçük harfe uyum
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 📌 Destek listesi
router.get('/', async (req, res) => {
    try {
        const supports = await Support.find();
        res.json(supports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Yeni destek ekleme (Sadece admin)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    const support = new Support(req.body);
    try {
        const savedSupport = await support.save();
        res.status(201).json(savedSupport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
