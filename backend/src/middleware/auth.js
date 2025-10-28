const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const AppError = require('../utils/AppError');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token bulunamadı' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.userId || decoded.id;
    req.user = { 
      userId: decoded.userId || decoded.id,
      id: decoded.userId || decoded.id
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ 
      success: false, 
      error: 'Geçersiz token' 
    });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu işlem için admin yetkisi gereklidir' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Yetki kontrolü başarısız' 
    });
  }
};

const isAdmin = requireAdmin;

module.exports = {
  authenticateToken,
  requireAdmin,
  isAdmin
};