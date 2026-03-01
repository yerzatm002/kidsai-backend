const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiters');

router.post('/api/auth/register',authLimiter, auth.register);
router.post('/api/auth/login', authLimiter, auth.login);
router.post('/api/auth/refresh', authLimiter, auth.refresh);

module.exports = router;