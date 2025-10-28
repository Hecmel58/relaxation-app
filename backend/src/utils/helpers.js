const calculateSleepDuration = (remDuration, deepSleep, lightSleep) => {
  return parseInt(remDuration || 0) + parseInt(deepSleep || 0) + parseInt(lightSleep || 0);
};

const validatePhoneNumber = (phone) => {
  return /^5[0-9]{9}$/.test(phone);
};

const sanitizeUser = (user) => {
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

module.exports = {
  calculateSleepDuration,
  validatePhoneNumber,
  sanitizeUser,
};