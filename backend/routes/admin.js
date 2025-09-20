const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Physio = require("../models/physio");
const Support = require("../models/support");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Tüm admin route'ları için middleware
router.use(authenticate);

// Admin yetkisi kontrol middleware
const checkAdmin = (req, res, next) => {
    console.log('Admin kontrol:', { user: req.user, role: req.user?.role });
    
    if (!req.user || req.user.role !== 'admin') {
        console.warn('Admin olmayan erişim:', req.user);
        return res.status(403).json({ 
            message: 'Admin yetkisi gerekli',
            currentRole: req.user?.role || 'none'
        });
    }
    
    next();
};

// Kullanıcı Listesi
router.get("/users", checkAdmin, async (req, res) => {
    try {
        console.log('Kullanıcılar getiriliyor...');
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        console.log(`${users.length} kullanıcı bulundu`);
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ message: "Kullanıcılar alınamadı", error: err.message });
    }
});

// Kullanıcı Ekleme
router.post("/users", checkAdmin, async (req, res) => {
    try {
        console.log('Yeni kullanıcı ekleniyor:', req.body);
        
        const { phone, password, name, role } = req.body;

        // Validation
        if (!phone || !password) {
            console.warn('Telefon veya şifre eksik');
            return res.status(400).json({ message: 'Telefon ve şifre zorunludur' });
        }

        if (password.length < 6) {
            console.warn('Şifre çok kısa');
            return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı' });
        }

        // Telefon numarası format kontrolü
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            console.warn('Geçersiz telefon formatı:', phone);
            return res.status(400).json({ message: 'Geçersiz telefon numarası formatı (10-11 rakam olmalı)' });
        }

        // Mevcut kullanıcı kontrolü
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            console.warn('Telefon numarası zaten kayıtlı:', phone);
            return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı' });
        }

        // Şifre hashle
        console.log('Şifre hashleniyor...');
        const hashedPassword = await bcrypt.hash(password, 12);

        // Yeni kullanıcı oluştur
        const newUser = new User({
            phone: phone.trim(),
            password: hashedPassword,
            name: name?.trim() || '',
            role: role || 'user'
        });

        const savedUser = await newUser.save();
        console.log('Kullanıcı başarıyla kaydedildi:', savedUser._id);
        
        // Response'da şifreyi gösterme
        const userResponse = {
            _id: savedUser._id,
            phone: savedUser.phone,
            name: savedUser.name,
            role: savedUser.role,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
        };
        
        res.status(201).json({ 
            message: "Kullanıcı başarıyla oluşturuldu", 
            user: userResponse 
        });
        
    } catch (err) {
        console.error("Kullanıcı oluşturma hatası:", err);
        
        // MongoDB duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({ message: "Bu telefon numarası zaten kayıtlı" });
        }
        
        // Validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        
        res.status(500).json({ 
            message: "Kullanıcı oluşturulamadı", 
            error: err.message 
        });
    }
});

// Kullanıcı Silme
router.delete("/users/:id", checkAdmin, async (req, res) => {
    try {
        console.log('Kullanıcı siliniyor:', req.params.id);
        
        const user = await User.findById(req.params.id);
        if (!user) {
            console.warn('Kullanıcı bulunamadı:', req.params.id);
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        // Admin'i silmeyi engelle
        if (user.role === 'admin') {
            console.warn('Admin silinmeye çalışıldı:', user.phone);
            return res.status(400).json({ message: "Admin kullanıcı silinemez" });
        }

        await User.findByIdAndDelete(req.params.id);
        console.log('Kullanıcı silindi:', user.phone);
        
        res.json({ message: "Kullanıcı silindi", deletedUser: { phone: user.phone, name: user.name } });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: "Kullanıcı silinemedi", error: err.message });
    }
});

// Tüm Physio Kayıtları
router.get("/physio", checkAdmin, async (req, res) => {
    try {
        console.log('Physio kayıtları getiriliyor...');
        const physios = await Physio.find()
            .populate('user', 'phone name')
            .sort({ createdAt: -1 })
            .limit(100); // Performans için limit
            
        console.log(`${physios.length} physio kaydı bulundu`);
        res.json(physios);
    } catch (err) {
        console.error('Get all physio error:', err);
        res.status(500).json({ message: "Fiziksel kayıtlar alınamadı", error: err.message });
    }
});

// Tüm Destek Talepleri
router.get("/support", checkAdmin, async (req, res) => {
    try {
        console.log('Destek talepleri getiriliyor...');
        const supports = await Support.find()
            .populate('user', 'phone name')
            .sort({ createdAt: -1 })
            .limit(100); // Performans için limit
            
        console.log(`${supports.length} destek talebi bulundu`);
        res.json(supports);
    } catch (err) {
        console.error('Get all support error:', err);
        res.status(500).json({ message: "Destek talepleri alınamadı", error: err.message });
    }
});

module.exports = router;