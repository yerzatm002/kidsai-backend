const router = require('express').Router();
const authGuard = require('../middlewares/authGuard');
const taskController = require('../controllers/task.controller');
const attemptController = require('../controllers/attempt.controller');

// read tasks per topic
router.get('/api/topics/:id/tasks', taskController.listTopicTasks);

// submit attempt (student must be logged in)
router.post('/api/tasks/:id/attempt', authGuard, attemptController.submitTaskAttempt);

module.exports = router;