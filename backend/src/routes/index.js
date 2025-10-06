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

router.post('/relaxation/track-usage', (req, res) => {
  res.json({ success: true, message: 'Relaxation usage tracked' });
});

router.post('/binaural/track-usage', (req, res) => {
  res.json({ success: true, message: 'Binaural usage tracked' });
});

router.get('/relaxation/content', (req, res) => {
  res.json({ success: true, content: [] });
});

router.get('/binaural/sounds', (req, res) => {
  res.json({ success: true, sounds: [] });
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