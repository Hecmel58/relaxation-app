const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token ? 'EXISTS' : 'MISSING');

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ 
      success: false, 
      error: 'Yetkilendirme token bulunamadı' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message);
      logger.warn(`Invalid token attempt from IP: ${req.ip}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Geçersiz veya süresi dolmuş token' 
      });
    }

    console.log('Decoded token:', decoded);

    if (!decoded.userId) {
      console.error('Token has no userId');
      return res.status(403).json({ 
        success: false, 
        error: 'Geçersiz token yapısı' 
      });
    }

    // ✅ DOĞRU: req.user objesi oluştur
    req.user = { userId: decoded.userId };
    req.userId = decoded.userId; // Geriye dönük uyumluluk için
    
    console.log('Auth successful. userId:', decoded.userId);
    console.log('=== AUTH MIDDLEWARE END ===');
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User ID bulunamadı' 
      });
    }
    
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      logger.warn(`Unauthorized admin access attempt by user ${userId}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Bu işlem için admin yetkisi gerekli' 
      });
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Yetki kontrolü sırasında hata oluştu' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};