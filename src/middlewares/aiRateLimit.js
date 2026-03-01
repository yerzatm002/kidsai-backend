const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    // если пользователь авторизован — лимитируем по userId
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    // fallback по IP через безопасный helper
    return ipKeyGenerator(req);
  },

  message: { error: 'Too many AI requests. Try again in a minute.' },
});

module.exports = aiRateLimit;