module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  BCRYPT_ROUNDS: 10,
  
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
    AUTH_MAX: 5,
    SKIP_SUCCESS: true // YENİ: Başarılı istekleri sayma
  },
  
  FORM_TYPES: {
    PERSONAL: 'personal',
    STRESS: 'stress',
    NURSING: 'nursing',
    PSQI: 'psqi',
  },
  
  AB_GROUPS: {
    CONTROL: 'control',
    EXPERIMENT: 'experiment',
  },

  ADMIN_CREDENTIALS: {
    PHONE: process.env.ADMIN_PHONE,
    PASSWORD: process.env.ADMIN_PASSWORD,
  },
};