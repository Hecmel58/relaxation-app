const express = require('express');
const Physio = require('../models/physio'); // 📌 küçük harfe uyum
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 📌 Fizyo listesi
router.get('/', async (req, res) => {
    try {
        const physios = await Physio.find();
        res.json(physios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 📌 Yeni fizyo ekleme (Sadece admin)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Yetkiniz yok' });
    }

    const physio = new Physio(req.body);
    try {
        const savedPhysio = await physio.save();
        res.status(201).json(savedPhysio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
