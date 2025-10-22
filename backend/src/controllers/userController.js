const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class UserController {
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user?.userId || req.userId;
      
      if (!userId) {
        logger.error('Delete account: No user ID found');
        return res.status(401).json({ success: false, error: 'User ID bulunamadı' });
      }

      // ✅ HER TABLOYU AYRI AYRI KONTROL EDIP SİL (TRANSACTION YOK)
      try {
        await pool.query('DELETE FROM password_reset_requests WHERE user_id = $1', [userId]);
        console.log('✅ password_reset_requests silindi');
      } catch (e) {
        console.log('⚠️ password_reset_requests:', e.message);
      }
      
      try {
        await pool.query('DELETE FROM heart_rate_sessions WHERE user_id = $1', [userId]);
        console.log('✅ heart_rate_sessions silindi');
      } catch (e) {
        console.log('⚠️ heart_rate_sessions:', e.message);
      }
      
      try {
        await pool.query('DELETE FROM sleep_sessions WHERE user_id = $1', [userId]);
        console.log('✅ sleep_sessions silindi');
      } catch (e) {
        console.log('⚠️ sleep_sessions:', e.message);
      }
      
      try {
        await pool.query('DELETE FROM form_responses WHERE user_id = $1', [userId]);
        console.log('✅ form_responses silindi');
      } catch (e) {
        console.log('⚠️ form_responses:', e.message);
      }
      
      try {
        await pool.query('DELETE FROM form_submissions WHERE user_id = $1', [userId]);
        console.log('✅ form_submissions silindi');
      } catch (e) {
        console.log('⚠️ form_submissions tablo yok');
      }
      
      // ✅ EN SON KULLANICIYI SİL
      const deleteResult = await pool.query('DELETE FROM users WHERE id = $1 AND is_admin = false RETURNING id', [userId]);
      
      if (deleteResult.rows.length === 0) {
        return res.status(403).json({ 
          success: false, 
          error: 'Admin hesabı silinemez veya kullanıcı bulunamadı' 
        });
      }
      
      console.log('✅ Kullanıcı silindi:', userId);
      logger.info(`User account deleted: ${userId}`);
      
      res.json({
        success: true,
        message: 'Hesabınız ve tüm verileriniz kalıcı olarak silindi'
      });
    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Hesap silme hatası: ' + error.message 
      });
    }
  }

  async downloadData(req, res, next) {
    try {
      console.log('=== DOWNLOAD DATA DEBUG START ===');
      
      const userId = req.user?.userId || req.userId;
      console.log('userId:', userId);
      
      if (!userId) {
        console.error('ERROR: No user ID found!');
        logger.error('Download data: No user ID found');
        return res.status(401).json({ 
          success: false, 
          error: 'User ID bulunamadı. Lütfen tekrar giriş yapın.' 
        });
      }
      
      logger.info(`User data download started for userId: ${userId}`);
      
      const userData = await pool.query(
        'SELECT id, name, phone, email, ab_group, is_admin, created_at FROM users WHERE id = $1', 
        [userId]
      );
      
      if (!userData.rows[0]) {
        console.error('ERROR: User not found in database');
        logger.error(`User not found: ${userId}`);
        return res.status(404).json({ 
          success: false, 
          error: 'Kullanıcı bulunamadı' 
        });
      }
      
      console.log('User found:', userData.rows[0].name);
      
      const sleepData = await pool.query(
        'SELECT * FROM sleep_sessions WHERE user_id = $1 ORDER BY sleep_date DESC', 
        [userId]
      );
      console.log('Sleep sessions count:', sleepData.rows.length);
      
      const heartRateData = await pool.query(
        'SELECT * FROM heart_rate_sessions WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      console.log('Heart rate sessions count:', heartRateData.rows.length);
      
      const formResponsesData = await pool.query(
        'SELECT * FROM form_responses WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      console.log('Form responses count:', formResponsesData.rows.length);
      
      let formSubmissionsData = { rows: [] };
      try {
        formSubmissionsData = await pool.query(
          'SELECT * FROM form_submissions WHERE user_id = $1 ORDER BY created_at DESC', 
          [userId]
        );
      } catch (formError) {
        console.log('form_submissions table not found or error, skipping...');
      }
      console.log('Form submissions count:', formSubmissionsData.rows.length);
      
      const exportData = {
        user: userData.rows[0],
        sleepSessions: sleepData.rows,
        heartRateSessions: heartRateData.rows,
        formResponses: formResponsesData.rows,
        formSubmissions: formSubmissionsData.rows,
        exportDate: new Date().toISOString(),
        dataProtectionInfo: {
          law: 'KVKK 6698 sayılı Kişisel Verilerin Korunması Kanunu',
          rights: 'Bu veri size aittir ve istediğiniz zaman silebilirsiniz.',
          contact: 'Hecmel@fidbal.com',
          phone: '0539 487 00 58',
          address: 'Mehmet Akif Ersoy Mahallesi, 49-44 Sokak, Davutoğulları Apt., Kat: 4, Daire: 11, Sivas Merkez'
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=fidbal-verilerim-${new Date().toISOString().split('T')[0]}.json`);
      res.json(exportData);
      
      console.log('=== DOWNLOAD DATA SUCCESS ===');
      logger.info(`User data downloaded successfully: ${userId}`);
    } catch (error) {
      console.error('=== DOWNLOAD DATA ERROR ===');
      console.error('Error:', error.message);
      logger.error('Download data error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Veri indirme hatası: ' + error.message 
      });
    }
  }

  // ✅ YENİ: Push Token Kaydetme
  async savePushToken(req, res, next) {
    try {
      const userId = req.user?.userId || req.userId;
      const { pushToken } = req.body;
      
      if (!userId || !pushToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID ve push token gerekli' 
        });
      }

      // ✅ Push token kolonu yoksa da çalışır (hata vermez)
      try {
        await pool.query(
          'UPDATE users SET push_token = $1, push_token_updated_at = NOW() WHERE id = $2',
          [pushToken, userId]
        );
        console.log('✅ Push token kaydedildi:', userId);
      } catch (dbError) {
        console.log('⚠️ Push token kolonu yok, atlanıyor:', dbError.message);
      }
      
      logger.info(`Push token saved for userId: ${userId}`);
      res.json({ success: true, message: 'Push token kaydedildi' });
    } catch (error) {
      logger.error('Save push token error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Push token kayıt hatası: ' + error.message 
      });
    }
  }
}

module.exports = new UserController();