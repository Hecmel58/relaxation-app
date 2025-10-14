const pool = require('../config/database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

class PasswordResetController {
  async requestPasswordReset(req, res, next) {
    try {
      const { phone } = req.body;
      
      const userResult = await pool.query(
        'SELECT id, name FROM users WHERE phone = $1',
        [phone]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bu telefon numarası ile kayıtlı kullanıcı bulunamadı'
        });
      }
      
      const user = userResult.rows[0];
      
      const existingRequest = await pool.query(
        'SELECT * FROM password_reset_requests WHERE user_id = $1 AND status = $2',
        [user.id, 'pending']
      );
      
      if (existingRequest.rows.length > 0) {
        return res.json({
          success: true,
          message: 'Zaten beklemede bir talebiniz var. Admin onayı bekleniyor.'
        });
      }
      
      await pool.query(
        'INSERT INTO password_reset_requests (user_id, phone, status, created_at) VALUES ($1, $2, $3, NOW())',
        [user.id, phone, 'pending']
      );
      
      logger.info(`Password reset request created for user: ${user.id}`);
      
      res.json({
        success: true,
        message: 'Şifre sıfırlama talebiniz alındı. Admin onayından sonra yeni şifreniz tarafınıza iletilecektir.'
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      next(error);
    }
  }

  async getPendingRequests(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT 
          pr.id,
          pr.user_id,
          pr.phone,
          pr.status,
          pr.created_at,
          u.name as user_name,
          u.email
        FROM password_reset_requests pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.status = 'pending'
        ORDER BY pr.created_at DESC
      `);
      
      res.json({
        success: true,
        requests: result.rows
      });
    } catch (error) {
      logger.error('Get pending requests error:', error);
      next(error);
    }
  }

  async approvePasswordReset(req, res, next) {
    try {
      const { requestId, newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifre en az 6 karakter olmalıdır'
        });
      }
      
      const requestResult = await pool.query(
        'SELECT * FROM password_reset_requests WHERE id = $1',
        [requestId]
      );
      
      if (requestResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talep bulunamadı'
        });
      }
      
      const request = requestResult.rows[0];
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, request.user_id]
      );
      
      await pool.query(
        'UPDATE password_reset_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['approved', requestId]
      );
      
      logger.info(`Password reset approved for user: ${request.user_id}`);
      
      res.json({
        success: true,
        message: 'Şifre başarıyla güncellendi',
        phone: request.phone,
        newPassword: newPassword
      });
    } catch (error) {
      logger.error('Approve password reset error:', error);
      next(error);
    }
  }

  async rejectPasswordReset(req, res, next) {
    try {
      const { requestId } = req.body;
      
      await pool.query(
        'UPDATE password_reset_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['rejected', requestId]
      );
      
      logger.info(`Password reset rejected for request: ${requestId}`);
      
      res.json({
        success: true,
        message: 'Talep reddedildi'
      });
    } catch (error) {
      logger.error('Reject password reset error:', error);
      next(error);
    }
  }
}

module.exports = new PasswordResetController();