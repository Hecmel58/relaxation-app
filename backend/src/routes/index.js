const express = require('express');
const router = express.Router();

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

// Chat endpoints
router.get('/chat/unread-count', (req, res) => {
  res.json({ success: true, unreadCount: 0 });
});

router.post('/chat/send-message', (req, res) => {
  res.json({ success: true, message: 'Mesaj gönderildi' });
});

router.post('/chat/video-call-request', (req, res) => {
  const { userId, userName, roomId } = req.body;
  console.log(`Video call request from ${userName} (${userId}) - Room: ${roomId}`);
  res.json({ success: true, message: 'Video call request received' });
});

// Tracking endpoints
router.post('/relaxation/track-usage', (req, res) => {
  res.json({ success: true, message: 'Usage tracked' });
});

router.post('/binaural/track-usage', (req, res) => {
  res.json({ success: true, message: 'Usage tracked' });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FidBal API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

module.exports = router;