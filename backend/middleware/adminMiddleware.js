// backend/middleware/adminMiddleware.js

module.exports = function (req, res, next) {
  try {
    // Kullanıcının admin olup olmadığını kontrol et
    if (req.user && req.user.role === 'admin') {
      next(); // Admin ise devam et
    } else {
      res.status(403).json({ message: 'Erişim reddedildi. Admin yetkisi gerekli.' });
    }
  } catch (err) {
    console.error('Admin middleware hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
