const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// ✅ Rahatlama içerikleri listesi
router.get('/content', async (req, res) => {
  const { category } = req.query;
  
  try {
    const query = category 
      ? 'SELECT * FROM relaxation_content WHERE category = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM relaxation_content ORDER BY created_at DESC';
    
    const params = category ? [category] : [];
    const result = await pool.query(query, params);
    
    res.json({ success: true, content: result.rows });
  } catch (error) {
    console.error('Relaxation content error:', error);
    res.status(500).json({ success: false, error: 'İçerik getirilemedi' });
  }
});

module.exports = router;