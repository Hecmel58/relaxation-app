const Joi = require('joi');

const heartRateSessionSchema = Joi.object({
  content_type: Joi.string().valid('relaxation', 'binaural').required(),
  content_id: Joi.string().required(),
  content_name: Joi.string().max(255).required(),
  heart_rate_before: Joi.number().integer().min(30).max(250).required(),
  heart_rate_after: Joi.number().integer().min(30).max(250).required(),
  duration: Joi.number().integer().min(0).max(7200).optional()
});

const validateHeartRateSession = (req, res, next) => {
  const { error } = heartRateSessionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz kalp atım hızı verisi',
      details: error.details[0].message
    });
  }
  
  next();
};

module.exports = { validateHeartRateSession };