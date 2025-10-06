const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, phone, email, password } = req.body;
      const result = await authService.register(name, phone, email, password);
      
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('zaten kayıtlı')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { phone, password } = req.body;
      const result = await authService.login(phone, password);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('hatalı')) {
        return res.status(401).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await authService.forgotPassword(phone);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('kayıtlı değil')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AuthController();