const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: errors.array()[0].msg,
      details: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('phone')
    .trim()
    .matches(/^5[0-9]{9}$/)
    .withMessage('Geçerli bir Türkiye telefon numarası girin (5XXXXXXXXX)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalı'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Ad soyad en az 2 karakter olmalı'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi girin'),
];

const loginValidation = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Telefon numarası gerekli'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gerekli'),
];

const sleepRecordValidation = [
  body('date')
    .optional()
    .isDate()
    .withMessage('Geçerli bir tarih girin'),
  body('sleep_quality')
    .isInt({ min: 1, max: 10 })
    .withMessage('Uyku kalitesi 1-10 arası olmalı'),
  body('rem_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('REM süresi 0 veya pozitif olmalı'),
  body('deep_sleep_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Derin uyku süresi 0 veya pozitif olmalı'),
  body('light_sleep_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Hafif uyku süresi 0 veya pozitif olmalı'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  sleepRecordValidation,
};