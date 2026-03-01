const router = require('express').Router();
const topicController = require('../controllers/topic.controller');

router.get('/api/topics', topicController.listTopics);
router.get('/api/topics/:id', topicController.getTopic);
router.get('/api/topics/:id/lesson', topicController.getTopicLesson);
router.get('/api/topics/:id/lessons', topicController.listTopicLessons);

module.exports = router;