const { z } = require('zod');
const { resolveLang } = require('../utils/lang');
const { mapTopic, mapLesson } = require('../utils/mappers');
const topicService = require('../services/topic.service');

const listQuerySchema = z.object({
  lang: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

exports.listTopics = async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const lang = resolveLang(q.lang);

    // пагинация опциональная (если нет page/pageSize — отдаём всё до 100)
    const page = q.page || 1;
    const pageSize = q.pageSize || 100;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const topics = await topicService.listTopics({ skip, take });

    res.json({
      lang,
      page,
      pageSize,
      items: topics.map(t => mapTopic(t, lang)),
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopic = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id } = req.params;

    const topic = await topicService.getTopicById(id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    res.json({ lang, topic: mapTopic(topic, lang) });
  } catch (err) {
    next(err);
  }
};

exports.getTopicLesson = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id: topicId } = req.params;

    // убедимся, что тема существует (полезно фронту)
    const topic = await topicService.getTopicById(topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const lesson = await topicService.getLessonByTopicId(topicId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found for this topic' });

    res.json({
      lang,
      topic: mapTopic(topic, lang),
      lesson: mapLesson(lesson, lang),
    });
  } catch (err) {
    next(err);
  }
};

exports.listTopicLessons = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id: topicId } = req.params;

    const topic = await topicService.getTopicById(topicId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const lessons = await topicService.listLessonsByTopicId(topicId);

    res.json({
      lang,
      topicId,
      items: lessons.map(l => mapLesson(l, lang)),
    });
  } catch (err) {
    next(err);
  }
};