const Joi = require('joi');

const sleepSessionSchema = Joi.object({
  date: Joi.date().max('now').optional(),
  bedtime: Joi.string().optional(),
  sleep_time: Joi.string().optional(),
  wake_time: Joi.string().optional(),
  total_sleep_minutes: Joi.number().integer().min(0).max(1440).optional(),
  sleep_quality: Joi.number().integer().min(0).max(10).required(),
  mood_before_sleep: Joi.number().integer().min(0).max(5).optional(),
  mood_after_sleep: Joi.number().integer().min(0).max(5).optional(),
  rem_duration: Joi.number().integer().min(0).max(1440).optional(),
  deep_sleep_duration: Joi.number().integer().min(0).max(1440).optional(),
  light_sleep_duration: Joi.number().integer().min(0).max(1440).optional(),
  awake_duration: Joi.number().integer().min(0).max(1440).optional(),
  night_awakenings: Joi.number().integer().min(0).max(50).optional(),
  snoring_level: Joi.number().integer().min(0).max(5).optional(),
  heart_rate: Joi.number().integer().min(30).max(250).optional(),
  stress_level: Joi.number().integer().min(0).max(10).optional(),
  screen_time: Joi.number().integer().min(0).max(1440).optional(),
  room_temperature: Joi.number().min(-10).max(50).optional(),
  meal_time: Joi.string().optional(),
  caffeine_intake: Joi.boolean().optional(),
  alcohol_intake: Joi.boolean().optional(),
  exercise_done: Joi.boolean().optional(),
  medication_taken: Joi.boolean().optional(),
  meditation_done: Joi.boolean().optional(),
  reading_done: Joi.boolean().optional(),
  notes: Joi.string().max(500).optional().allow('')
});

const validateSleepSession = (req, res, next) => {
  const { error } = sleepSessionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Geçersiz veri formatı',
      details: error.details[0].message
    });
  }
  
  next();
};

module.exports = { validateSleepSession };