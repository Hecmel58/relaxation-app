const sleepService = require('../services/sleepService');

class SleepController {
  async createSession(req, res, next) {
    try {
      const session = await sleepService.createSession(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Uyku kaydı oluşturuldu',
        session
      });
    } catch (error) {
      console.error('Create session error:', error);
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const sessions = await sleepService.getUserSessions(req.userId, limit);
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      next(error);
    }
  }

  async getSession(req, res, next) {
    try {
      const session = await sleepService.getSessionById(req.params.id, req.userId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Uyku kaydı bulunamadı'
        });
      }
      
      res.json({
        success: true,
        session
      });
    } catch (error) {
      console.error('Get session error:', error);
      next(error);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const deleted = await sleepService.deleteSession(req.params.id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Uyku kaydı bulunamadı'
        });
      }
      
      res.json({
        success: true,
        message: 'Uyku kaydı silindi'
      });
    } catch (error) {
      console.error('Delete session error:', error);
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const period = req.query.period || 'week';
      const analytics = await sleepService.getAnalytics(req.userId, period);
      
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      next(error);
    }
  }
}

module.exports = new SleepController();