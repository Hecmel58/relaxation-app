const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class UserController {
  async deleteAccount(req, res, next) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userId = req.user.userId;
      
      await client.query('DELETE FROM password_reset_requests WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM heart_rate_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM sleep_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM form_responses WHERE user_id = $1', [userId]);
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
      next(error);
    } finally {
      client.release();
    }
  }

  async downloadData(req, res, next) {
    try {
      const userId = req.user.userId;
      
      const userData = await pool.query(
        'SELECT id, name, phone, email, ab_group, is_admin, created_at FROM users WHERE id = $1', 
        [userId]
      );
      const sleepData = await pool.query(
        'SELECT * FROM sleep_sessions WHERE user_id = $1 ORDER BY sleep_date DESC', 
        [userId]
      );
      const heartRateData = await pool.query(
        'SELECT * FROM heart_rate_sessions WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      const formData = await pool.query(
        'SELECT * FROM form_responses WHERE user_id = $1 ORDER BY created_at DESC', 
        [userId]
      );
      
      const exportData = {
        user: userData.rows[0],
        sleepSessions: sleepData.rows,
        heartRateSessions: heartRateData.rows,
        formResponses: formData.rows,
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
      
      logger.info(`User data downloaded: ${userId}`);
    } catch (error) {
      logger.error('Download data error:', error);
      next(error);
    }
  }
}

module.exports = new UserController();