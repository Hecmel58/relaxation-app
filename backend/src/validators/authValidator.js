const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email().optional().allow(''),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Şifre en az 8 karakter olmalıdır',
      'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter (@$!%*?&) içermelidir'
    }),
  abGroup: Joi.string().valid('control', 'experiment').optional(),
  isAdmin: Joi.boolean().optional()
});

const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz kayıt bilgileri',
      details: error.details[0].message
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz giriş bilgileri',
      details: error.details[0].message
    });
  }
  
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz telefon numarası',
      details: error.details[0].message
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword
};