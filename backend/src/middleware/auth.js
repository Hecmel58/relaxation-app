const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Yetkilendirme token bulunamadı', 401));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Invalid token attempt from IP: ${req.ip}`);
      return next(new AppError('Geçersiz veya süresi dolmuş token', 403));
    }

    if (!decoded.userId) {
      return next(new AppError('Geçersiz token yapısı', 403));
    }

    req.userId = decoded.userId;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      logger.warn(`Unauthorized admin access attempt by user ${req.userId}`);
      return next(new AppError('Bu işlem için admin yetkisi gerekli', 403));
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return next(new AppError('Yetki kontrolü sırasında hata oluştu', 500));
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
};