const { body, validationResult } = require('express-validator');

const validateHeartRateSession = [
  body('content_type').optional().isString(),
  body('content_id').optional(),
  body('content_name').optional().isString(),
  body('heart_rate_before').optional().isInt({ min: 30, max: 250 }),
  body('heart_rate_after').optional().isInt({ min: 30, max: 250 }),
  body('duration').optional().isInt({ min: 0 }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

module.exports = {
  validateHeartRateSession
};