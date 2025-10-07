const sleepService = require('../services/sleepService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class SleepController {
  async createSession(req, res, next) {
    try {
      const session = await sleepService.createSession(req.userId, req.body);
      
      logger.info(`Sleep session created by user ${req.userId}`);
      
      res.status(201).json({
        success: true,
        message: 'Uyku kaydı oluşturuldu',
        session
      });
    } catch (error) {
      logger.error('Create session error:', error);
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      
      if (limit < 1 || limit > 100) {
        return next(new AppError('Limit 1-100 arasında olmalıdır', 400));
      }
      
      const sessions = await sleepService.getUserSessions(req.userId, limit);
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      next(error);
    }
  }

  async getSession(req, res, next) {
    try {
      const session = await sleepService.getSessionById(req.params.id, req.userId);
      
      if (!session) {
        return next(new AppError('Uyku kaydı bulunamadı', 404));
      }
      
      res.json({
        success: true,
        session
      });
    } catch (error) {
      logger.error('Get session error:', error);
      next(error);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const deleted = await sleepService.deleteSession(req.params.id, req.userId);
      
      if (!deleted) {
        return next(new AppError('Uyku kaydı bulunamadı', 404));
      }
      
      logger.info(`Sleep session ${req.params.id} deleted by user ${req.userId}`);
      
      res.json({
        success: true,
        message: 'Uyku kaydı silindi'
      });
    } catch (error) {
      logger.error('Delete session error:', error);
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const period = req.query.period || 'week';
      
      if (!['week', 'month', 'year'].includes(period)) {
        return next(new AppError('Geçersiz periyod. week, month veya year olmalıdır', 400));
      }
      
      const analytics = await sleepService.getAnalytics(req.userId, period);
      
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      next(error);
    }
  }
}

module.exports = new SleepController();