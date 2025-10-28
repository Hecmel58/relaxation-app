const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message
      });
    }
    
    console.error('ERROR:', err);
    return res.status(500).json({
      success: false,
      error: 'Bir hata oluştu'
    });
  } else {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
};

module.exports = { errorHandler };