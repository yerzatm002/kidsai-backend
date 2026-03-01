const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const ctrl = require('../controllers/lessonView.controller');

router.post('/api/lessons/:id/view', authGuard, ctrl.markLessonViewed);

module.exports = router;