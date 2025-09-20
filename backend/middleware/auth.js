// backend/middleware/auth.js - Tek ve tutarlı middleware
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Temel authentication
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Token gerekli' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kullanıcıyı veritabanından getir (güvenlik için)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
        }

        req.user = {
            id: user._id,
            phone: user.phone,
            role: user.role,
            name: user.name
        };

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }
};

// Admin yetkisi kontrolü
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Önce giriş yapmalısınız' });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin yetkisi gerekli' });
    }
    
    next();
};

module.exports = {
    authenticate,
    requireAdmin
};