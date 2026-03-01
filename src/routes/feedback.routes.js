const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');

const feedback = require('../controllers/feedback.controller');
const teacherFeedback = require('../controllers/teacherFeedback.controller');

// любой авторизованный пользователь
router.post('/api/feedback', authGuard, feedback.create);

// только teacher (по желанию)
router.get('/api/teacher/feedback', authGuard, roleGuard(['TEACHER']), teacherFeedback.list);

module.exports = router;