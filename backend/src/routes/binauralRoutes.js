const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// ✅ Binaural sesler listesi
router.get('/sounds', async (req, res) => {
  const { category } = req.query;
  
  try {
    const query = category 
      ? 'SELECT * FROM binaural_sounds WHERE brainwave_type = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM binaural_sounds ORDER BY created_at DESC';
    
    const params = category ? [category] : [];
    const result = await pool.query(query, params);
    
    res.json({ success: true, sounds: result.rows });
  } catch (error) {
    console.error('Binaural sounds error:', error);
    res.status(500).json({ success: false, error: 'Sesler getirilemedi' });
  }
});

module.exports = router;