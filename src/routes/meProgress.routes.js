const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const meProgress = require('../controllers/meProgress.controller');
const meDashboard = require('../controllers/meDashboard.controller');

router.get('/api/me/progress', authGuard, meProgress.getProgress);
router.get('/api/me/dashboard', authGuard, meDashboard.getDashboard);

module.exports = router;