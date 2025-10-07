const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, phone, email, password } = req.body;
      const result = await authService.register(name, phone, email, password);
      
      logger.info(`New user registered: ${phone}`);
      
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('zaten kayıtlı')) {
        return next(new AppError(error.message, 400));
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { phone, password } = req.body;
      const result = await authService.login(phone, password);
      
      logger.info(`User logged in: ${phone}`);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('hatalı')) {
        logger.warn(`Failed login attempt for phone: ${req.body.phone} from IP: ${req.ip}`);
        return next(new AppError(error.message, 401));
      }
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await authService.forgotPassword(phone);
      
      logger.info(`Password reset requested for: ${phone}`);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      if (error.message.includes('kayıtlı değil')) {
        return next(new AppError(error.message, 404));
      }
      next(error);
    }
  }
}

module.exports = new AuthController();