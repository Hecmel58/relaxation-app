const adminService = require('../services/adminService');

class AdminController {
  async getUsers(req, res, next) {
    try {
      const users = await adminService.getAllUsers();
      
      res.json({
        success: true,
        users
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getSleepData(req, res, next) {
    try {
      const sessions = await adminService.getAllSleepData();
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSleepHistory(req, res, next) {
    try {
      const sessions = await adminService.getUserSleepHistory(req.params.userId);
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, phone, email, password, abGroup } = req.body;
      const user = await adminService.createUser(name, phone, email, password, abGroup);
      
      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      if (error.message.includes('zaten kayıtlı')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await adminService.updateUser(req.params.userId, req.body);
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      if (error.message.includes('bulunamadı')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await adminService.deleteUser(req.params.userId);
      
      res.json({
        success: true,
        message: 'Kullanıcı silindi'
      });
    } catch (error) {
      if (error.message.includes('bulunamadı') || error.message.includes('silinemez')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AdminController();