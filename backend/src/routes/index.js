const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const sleepRoutes = require('./sleepRoutes');
const formRoutes = require('./formRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/sleep', sleepRoutes);
router.use('/forms', formRoutes);
router.use('/admin', adminRoutes);

// Chat endpoints - geçici placeholder
router.get('/chat/unread-count', (req, res) => {
  res.json({ success: true, unreadCount: 0 });
});

router.post('/chat/send-message', (req, res) => {
  res.json({ success: true, message: 'Mesaj gönderildi' });
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