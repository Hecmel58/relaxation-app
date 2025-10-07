const pool = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class HeartRateController {
  async createSession(req, res, next) {
    try {
      const { content_type, content_id, content_name, heart_rate_before, heart_rate_after, duration } = req.body;
      
      const query = `
        INSERT INTO heart_rate_sessions (
          user_id, content_type, content_id, content_name,
          heart_rate_before, heart_rate_after, duration, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      
      const values = [
        req.userId,
        content_type,
        content_id,
        content_name,
        heart_rate_before,
        heart_rate_after,
        duration || 0
      ];
      
      const result = await pool.query(query, values);
      
      logger.info(`Heart rate session created by user ${req.userId}`);
      
      res.status(201).json({
        success: true,
        message: 'Kalp atım hızı kaydedildi',
        session: result.rows[0]
      });
    } catch (error) {
      logger.error('Heart rate session error:', error);
      next(error);
    }
  }

  async getUserSessions(req, res, next) {
    try {
      const query = `
        SELECT * FROM heart_rate_sessions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      
      const result = await pool.query(query, [req.userId]);
      
      res.json({
        success: true,
        sessions: result.rows
      });
    } catch (error) {
      logger.error('Get user sessions error:', error);
      next(error);
    }
  }

  async getAllSessions(req, res, next) {
    try {
      const query = `
        SELECT 
          hrs.*,
          u.name as user_name,
          u.phone as user_phone,
          u.ab_group
        FROM heart_rate_sessions hrs
        JOIN users u ON hrs.user_id = u.id
        ORDER BY hrs.created_at DESC
        LIMIT 200
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        sessions: result.rows
      });
    } catch (error) {
      logger.error('Get all sessions error:', error);
      next(error);
    }
  }

  async getUserHistory(req, res, next) {
    try {
      const { userId } = req.params;
      
      const query = `
        SELECT * FROM heart_rate_sessions
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      
      res.json({
        success: true,
        sessions: result.rows
      });
    } catch (error) {
      logger.error('Get user history error:', error);
      next(error);
    }
  }
}

module.exports = new HeartRateController();