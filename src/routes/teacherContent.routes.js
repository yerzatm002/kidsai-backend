const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const roleGuard = require('../middlewares/roleGuard');
const teacher = require('../controllers/teacher.controller');

// RBAC applied for entire module
router.use('/api/teacher', authGuard, roleGuard(['TEACHER']));

/**
 * Topics
 */
router.post('/api/teacher/topics', teacher.createTopic);
router.patch('/api/teacher/topics/:id', teacher.updateTopic);

/**
 * Lessons
 */
router.post('/api/teacher/topics/:id/lesson', teacher.createLessonForTopic);
router.patch('/api/teacher/lessons/:id', teacher.updateLesson);

/**
 * Tasks
 */
router.post('/api/teacher/topics/:id/tasks', teacher.createTaskForTopic);
router.patch('/api/teacher/tasks/:id', teacher.updateTask);

/**
 * Tests + Questions
 */
router.post('/api/teacher/topics/:id/test', teacher.createTestForTopic);
router.post('/api/teacher/tests/:id/questions', teacher.createQuestion);
router.patch('/api/teacher/questions/:id', teacher.updateQuestion);

module.exports = router;