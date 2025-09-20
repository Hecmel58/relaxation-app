const express = require('express');
const Support = require('../models/support');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 📌 Kullanıcının kendi destek talepleri
router.get('/', authenticate, async (req, res) => {
    try {
        const supports = await Support.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(supports);
    } catch (error) {
        console.error('Support get error:', error);
        res.status(500).json({ message: 'Destek talepleri getirilemedi' });
    }
});

// 📌 Yeni destek talebi oluşturma
router.post('/', authenticate, async (req, res) => {
    try {
        const supportData = {
            ...req.body,
            user: req.user.id, // Kullanıcı ID'sini otomatik ekle
            name: req.body.name || req.user.name || 'Anonim',
            phone: req.body.phone || req.user.phone || ''
        };

        const support = new Support(supportData);
        const savedSupport = await support.save();
        
        // Response'ta user bilgilerini de göster
        await savedSupport.populate('user', 'phone name');
        
        res.status(201).json(savedSupport);
    } catch (error) {
        console.error('Support create error:', error);
        res.status(400).json({ message: 'Destek talebi oluşturulamadı', error: error.message });
    }
});

// 📌 Destek talebini güncelleme
router.put('/:id', authenticate, async (req, res) => {
    try {
        const support = await Support.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!support) {
            return res.status(404).json({ message: 'Destek talebi bulunamadı' });
        }

        Object.assign(support, req.body);
        const updatedSupport = await support.save();
        
        res.json(updatedSupport);
    } catch (error) {
        console.error('Support update error:', error);
        res.status(400).json({ message: 'Destek talebi güncellenemedi', error: error.message });
    }
});

// 📌 Destek talebini silme
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const support = await Support.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!support) {
            return res.status(404).json({ message: 'Destek talebi bulunamadı' });
        }

        res.json({ message: 'Destek talebi silindi' });
    } catch (error) {
        console.error('Support delete error:', error);
        res.status(500).json({ message: 'Destek talebi silinemedi' });
    }
});

module.exports = router;