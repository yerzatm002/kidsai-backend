const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const aiRateLimit = require('../middlewares/aiRateLimit');
const ctrl = require('../controllers/ai.controller');

router.post('/api/ai/help', authGuard, aiRateLimit, ctrl.help);

module.exports = router;