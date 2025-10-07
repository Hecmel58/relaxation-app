const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class UserController {
  async deleteAccount(req, res, next) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userId = req.userId;
      
      await client.query('DELETE FROM heart_rate_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM sleep_sessions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM form_submissions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);
      await client.query('DELETE FROM video_calls WHERE participant1_id = $1 OR participant2_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      
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
      const userId = req.userId;
      
      const userData = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const sleepData = await pool.query('SELECT * FROM sleep_sessions WHERE user_id = $1', [userId]);
      const heartRateData = await pool.query('SELECT * FROM heart_rate_sessions WHERE user_id = $1', [userId]);
      const formData = await pool.query('SELECT * FROM form_submissions WHERE user_id = $1', [userId]);
      
      const exportData = {
        user: userData.rows[0],
        sleepSessions: sleepData.rows,
        heartRateSessions: heartRateData.rows,
        formSubmissions: formData.rows,
        exportDate: new Date().toISOString()
      };
      
      delete exportData.user.password;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=fidbal-verilerim.json');
      res.json(exportData);
    } catch (error) {
      logger.error('Download data error:', error);
      next(error);
    }
  }
}

module.exports = new UserController();