const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const testController = require('../controllers/test.controller');
const testAttemptController = require('../controllers/testAttempt.controller');

router.get('/api/topics/:id/test', testController.getTopicTest);
router.post('/api/tests/:id/attempt', authGuard, testAttemptController.submitTestAttempt);

module.exports = router;