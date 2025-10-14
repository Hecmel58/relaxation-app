const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const sleepRoutes = require('./sleepRoutes');
const formRoutes = require('./formRoutes');
const adminRoutes = require('./adminRoutes');
const heartRateRoutes = require('./heartRateRoutes');
const userRoutes = require('./userRoutes');
const binauralRoutes = require('./binauralRoutes');
const relaxationRoutes = require('./relaxationRoutes');

router.use('/auth', authRoutes);
router.use('/sleep', sleepRoutes);
router.use('/forms', formRoutes);
router.use('/admin', adminRoutes);
router.use('/heart-rate', heartRateRoutes);
router.use('/user', userRoutes);
router.use('/binaural', binauralRoutes);
router.use('/relaxation', relaxationRoutes);

// ✅ CHAT ENDPOINTS - VERİTABANI ENTEGRASYONU
router.get('/chat/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE user_id = $1 AND is_admin = true AND is_read = false',
      [req.userId]
    );
    
    res.json({ 
      success: true, 
      unreadCount: parseInt(result.rows[0]?.count || 0)
    });
  } catch (error) {
    console.error('Unread count error:', error);
    res.json({ success: true, unreadCount: 0 });
  }
});

router.post('/chat/send-message', authenticateToken, async (req, res) => {
  try {
    const { message, userId, userName } = req.body;
    const user_id = req.userId || userId;

    await pool.query(
      'INSERT INTO chat_messages (user_id, sender_name, message, is_admin, created_at) VALUES ($1, $2, $3, false, NOW())',
      [user_id, userName, message]
    );

    console.log(`💬 Mesaj kaydedildi: ${userName} - ${message}`);
    
    res.json({ success: true, message: 'Mesaj gönderildi' });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ success: false, error: 'Mesaj gönderilemedi' });
  }
});

router.get('/chat/messages', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    
    await pool.query(
      'UPDATE chat_messages SET is_read = true WHERE user_id = $1 AND is_admin = false',
      [req.userId]
    );
    
    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Mesajlar getirilemedi' });
  }
});

router.post('/chat/video-call-request', authenticateToken, async (req, res) => {
  try {
    const { userId, userName, roomId } = req.body;
    console.log(`📹 Video call request from ${userName} (${userId}) - Room: ${roomId}`);
    
    await pool.query(
      'INSERT INTO chat_messages (user_id, sender_name, message, is_admin, created_at) VALUES ($1, $2, $3, false, NOW())',
      [userId, userName, `📹 Görüntülü görüşme talebi: ${roomId}`]
    );
    
    res.json({ success: true, message: 'Video call request received' });
  } catch (error) {
    console.error('Video call request error:', error);
    res.status(500).json({ success: false, error: 'Talep gönderilemedi' });
  }
});

router.post('/relaxation/track-usage', (req, res) => {
  res.json({ success: true, message: 'Usage tracked' });
});

router.post('/binaural/track-usage', (req, res) => {
  res.json({ success: true, message: 'Usage tracked' });
});

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FidBal API is running',
    timestamp: new Date().toISOString()
  });
});

router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

module.exports = router;