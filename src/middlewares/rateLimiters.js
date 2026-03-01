const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 запросов/15 мин на IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, try later.' },
});

module.exports = { authLimiter };