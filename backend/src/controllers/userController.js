const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class UserController {
  async deleteAccount(req, res, next) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userId = req.user?.userId || req.userId;
      
      if (!userId) {
        logger.error('Delete account: No user ID found');
        return res.status(401).json({ success: false, error: 'User ID bulunamadı' });
      }
      
      await client.query('DELETE FROM password_reset_requests WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM heart_rate_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM sleep_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM form_submissions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);
      await client.query('DELETE FROM video_calls WHERE participant1_id = $1 OR participant2_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1 AND is_admin = false', [userId]);
      
      await client.query('COMMIT');
      
      logger.info(`User account deleted: ${userId}`);
      
      res.json({
        success: true,
        message: 'Hesabınız ve tüm verileriniz kalıcı olarak silindi'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Delete account error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Hesap silme hatası: ' + error.message 
      });
    } finally {
      client.release();
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
      
      // USER DATA
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
      
      // SLEEP SESSIONS
      const sleepData = await pool.query(
        'SELECT * FROM sleep_sessions WHERE user_id = $1 ORDER BY sleep_date DESC', 
        [userId]
      );
      console.log('Sleep sessions count:', sleepData.rows.length);
      
      // HEART RATE SESSIONS
      const heartRateData = await pool.query(
        'SELECT * FROM heart_rate_sessions WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      console.log('Heart rate sessions count:', heartRateData.rows.length);
      
      // FORM SUBMISSIONS - KOLON ADINI KONTROL ETMEDEN AL
      let formData = { rows: [] };
      try {
        // Önce created_at ile dene
        formData = await pool.query(
          'SELECT * FROM form_submissions WHERE user_id = $1 ORDER BY created_at DESC', 
          [userId]
        );
      } catch (formError) {
        console.log('created_at column not found, trying submitted_at...');
        try {
          // submitted_at ile dene
          formData = await pool.query(
            'SELECT * FROM form_submissions WHERE user_id = $1 ORDER BY submitted_at DESC', 
            [userId]
          );
        } catch (formError2) {
          console.log('submitted_at column not found, trying without ORDER BY...');
          try {
            // Sıralama olmadan al
            formData = await pool.query(
              'SELECT * FROM form_submissions WHERE user_id = $1', 
              [userId]
            );
          } catch (formError3) {
            console.error('Form submissions query failed:', formError3.message);
            // Form verisi yoksa boş array kullan
            formData = { rows: [] };
          }
        }
      }
      console.log('Form submissions count:', formData.rows.length);
      
      const exportData = {
        user: userData.rows[0],
        sleepSessions: sleepData.rows,
        heartRateSessions: heartRateData.rows,
        formSubmissions: formData.rows,
        exportDate: new Date().toISOString(),
        dataProtectionInfo: {
          law: 'KVKK 6698 sayılı Kişisel Verilerin Korunması Kanunu',
          rights: 'Bu veri size aittir ve istediğiniz zaman silebilirsiniz.',
          contact: 'ecmelazizoglu@gmail.com',
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
}

module.exports = new UserController();