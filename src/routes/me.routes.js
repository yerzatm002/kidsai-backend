const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const me = require('../controllers/me.controller');

router.get('/api/me/badges', authGuard, me.getMyBadges);
router.get('/api/me/stats', authGuard, me.getMyStats);
router.get('/api/me', authGuard, me.getMe);

module.exports = router;