const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const pool = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Yetkilendirme token bulunamadı' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Geçersiz veya süresi dolmuş token' 
      });
    }

    if (!decoded.userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Geçersiz token yapısı' 
      });
    }

    req.userId = decoded.userId;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    try {
      const result = await pool.query(
        'SELECT is_admin FROM users WHERE id = $1',
        [req.userId]
      );

      if (result.rows.length === 0 || !result.rows[0].is_admin) {
        return res.status(403).json({
          success: false,
          error: 'Bu işlem için admin yetkisi gerekli'
        });
      }

      next();
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Yetki kontrolü sırasında hata oluştu' 
      });
    }
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
};