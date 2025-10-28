const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.get('/types', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    
    const formsResult = await pool.query(
      'SELECT id, title, description, google_form_url, is_active, created_at FROM form_types WHERE is_active = true ORDER BY created_at DESC'
    );
    const forms = formsResult.rows || [];
    
    const userResponsesResult = await pool.query(
      'SELECT form_type_id, created_at FROM form_responses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const userResponses = userResponsesResult.rows || [];
    
    const formsWithStatus = forms.map(form => ({
      ...form,
      is_filled: userResponses.some(r => r.form_type_id === form.id),
      last_filled_at: userResponses.find(r => r.form_type_id === form.id)?.created_at || null
    }));
    
    res.json(formsWithStatus);
  } catch (error) {
    console.error('Form tipleri getirme hatası:', error);
    res.status(500).json({ error: 'Formlar getirilemedi', details: error.message });
  }
});

router.post('/responses', authenticateToken, async (req, res) => {
  const { form_type_id, responses } = req.body;
  const userId = req.userId || req.user?.userId || req.user?.id;
  
  try {
    console.log('📝 Form yanıtı kaydediliyor:', {
      userId,
      form_type_id,
      responses
    });

    const existingResponse = await pool.query(
      'SELECT id FROM form_responses WHERE user_id = $1 AND form_type_id = $2',
      [userId, form_type_id]
    );

    if (existingResponse.rows.length > 0) {
      await pool.query(
        'UPDATE form_responses SET responses = $1, created_at = NOW() WHERE user_id = $2 AND form_type_id = $3',
        [JSON.stringify(responses), userId, form_type_id]
      );
      console.log('✅ Form yanıtı güncellendi');
    } else {
      await pool.query(
        'INSERT INTO form_responses (user_id, form_type_id, responses, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, form_type_id, JSON.stringify(responses)]
      );
      console.log('✅ Form yanıtı eklendi');
    }
    
    res.json({ success: true, message: 'Form yanıtı kaydedildi' });
  } catch (error) {
    console.error('❌ Form yanıtı kaydetme hatası:', error);
    res.status(500).json({ error: 'Form yanıtı kaydedilemedi' });
  }
});

router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    const adminCheckResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!adminCheckResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Yetkiniz yok' });
    }
    
    const formsResult = await pool.query(`
      SELECT 
        ft.id, 
        ft.title, 
        ft.description, 
        ft.google_form_url, 
        ft.is_active,
        ft.created_at,
        COUNT(DISTINCT fr.user_id) as response_count,
        COUNT(DISTINCT fr.id) as total_responses
      FROM form_types ft
      LEFT JOIN form_responses fr ON ft.id = fr.form_type_id
      GROUP BY ft.id, ft.title, ft.description, ft.google_form_url, ft.is_active, ft.created_at
      ORDER BY ft.created_at DESC
    `);
    
    res.json(formsResult.rows || []);
  } catch (error) {
    console.error('Admin form listesi hatası:', error);
    res.status(500).json({ error: 'Formlar getirilemedi' });
  }
});

router.post('/admin/add', authenticateToken, async (req, res) => {
  const { title, description, google_form_url } = req.body;
  
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    const adminCheckResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!adminCheckResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Yetkiniz yok' });
    }
    
    if (!google_form_url || !google_form_url.includes('docs.google.com/forms')) {
      return res.status(400).json({ error: 'Geçerli bir Google Form URL\'si giriniz' });
    }
    
    const result = await pool.query(
      'INSERT INTO form_types (title, description, google_form_url, is_active, created_at) VALUES ($1, $2, $3, true, NOW()) RETURNING id',
      [title || 'Yeni Form', description || '', google_form_url]
    );
    
    res.json({ 
      success: true, 
      message: 'Form başarıyla eklendi',
      form_id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Form ekleme hatası:', error);
    res.status(500).json({ error: 'Form eklenemedi' });
  }
});

router.patch('/admin/:id/toggle', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    const adminCheckResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!adminCheckResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Yetkiniz yok' });
    }
    
    await pool.query(
      'UPDATE form_types SET is_active = NOT is_active WHERE id = $1',
      [id]
    );
    
    res.json({ success: true, message: 'Form durumu güncellendi' });
  } catch (error) {
    console.error('Form durumu güncelleme hatası:', error);
    res.status(500).json({ error: 'Form durumu güncellenemedi' });
  }
});

router.get('/admin/responses/:formId', authenticateToken, async (req, res) => {
  const { formId } = req.params;
  
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    const adminCheckResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!adminCheckResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Yetkiniz yok' });
    }
    
    const responsesResult = await pool.query(`
      SELECT 
        fr.id,
        fr.responses,
        fr.created_at,
        u.id as user_id,
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email
      FROM form_responses fr
      JOIN users u ON fr.user_id = u.id
      WHERE fr.form_type_id = $1
      ORDER BY fr.created_at DESC
    `, [formId]);
    
    console.log('📊 Form yanıtları:', responsesResult.rows);
    
    // ✅ responses'u olduğu gibi gönder
    res.json(responsesResult.rows);
  } catch (error) {
    console.error('Form yanıtları getirme hatası:', error);
    res.status(500).json({ error: 'Yanıtlar getirilemedi' });
  }
});

router.delete('/admin/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const userId = req.userId || req.user?.userId || req.user?.id;
    const adminCheckResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    if (!adminCheckResult.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Yetkiniz yok' });
    }
    
    await pool.query('DELETE FROM form_responses WHERE form_type_id = $1', [id]);
    await pool.query('DELETE FROM form_types WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Form silindi' });
  } catch (error) {
    console.error('Form silme hatası:', error);
    res.status(500).json({ error: 'Form silinemedi' });
  }
});

module.exports = router;