const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/forgot-password', authController.forgotPassword);

// Token doğrulama endpoint'i
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(
      'SELECT id, name, phone, email, is_admin, ab_group FROM users WHERE id = $1',
      [req.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Token doğrulama hatası' });
  }
});

module.exports = router;