const express = require('express');
const Physio = require('../models/physio');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 📌 Kullanıcının kendi physio kayıtları
router.get('/', authenticate, async (req, res) => {
    try {
        const physios = await Physio.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(physios);
    } catch (error) {
        console.error('Physio get error:', error);
        res.status(500).json({ message: 'Kayıtlar getirilemedi' });
    }
});

// 📌 Yeni physio kaydı ekleme (Kullanıcı kendi kaydını ekler)
router.post('/', authenticate, async (req, res) => {
    try {
        const physioData = {
            ...req.body,
            user: req.user.id, // Kullanıcı ID'sini otomatik ekle
            date: req.body.date || new Date() // Eğer tarih gönderilmezse bugünü kullan
        };

        const physio = new Physio(physioData);
        const savedPhysio = await physio.save();
        
        // Response'ta user bilgilerini de göster
        await savedPhysio.populate('user', 'phone name');
        
        res.status(201).json(savedPhysio);
    } catch (error) {
        console.error('Physio create error:', error);
        res.status(400).json({ message: 'Kayıt oluşturulamadı', error: error.message });
    }
});

// 📌 Physio kaydını güncelleme
router.put('/:id', authenticate, async (req, res) => {
    try {
        const physio = await Physio.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!physio) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }

        Object.assign(physio, req.body);
        const updatedPhysio = await physio.save();
        
        res.json(updatedPhysio);
    } catch (error) {
        console.error('Physio update error:', error);
        res.status(400).json({ message: 'Kayıt güncellenemedi', error: error.message });
    }
});

// 📌 Physio kaydını silme
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const physio = await Physio.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        
        if (!physio) {
            return res.status(404).json({ message: 'Kayıt bulunamadı' });
        }

        res.json({ message: 'Kayıt silindi' });
    } catch (error) {
        console.error('Physio delete error:', error);
        res.status(500).json({ message: 'Kayıt silinemedi' });
    }
});

module.exports = router;