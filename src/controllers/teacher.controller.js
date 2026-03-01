const { z } = require('zod');
const service = require('../services/teacherContent.service');

/**
 * TOPIC DTO
 */
const topicCreateSchema = z.object({
  titleKz: z.string().min(1),
  titleRu: z.string().min(1),
  descriptionKz: z.string().min(1),
  descriptionRu: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
});

const topicPatchSchema = topicCreateSchema.partial();

/**
 * LESSON DTO
 */
const lessonCreateSchema = z.object({
  contentKz: z.string().min(1),
  contentRu: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  attachments: z.any().optional().nullable(), // Json
  orderIndex: z.number().int().min(0).optional(),
});

const lessonPatchSchema = lessonCreateSchema.partial();

/**
 * TASK DTO
 */
const taskCreateSchema = z.object({
  type: z.enum(['SIMPLE', 'DRAG_DROP', 'QA']),
  promptKz: z.string().min(1),
  promptRu: z.string().min(1),
  payload: z.any(), // Json, структура зависит от type
  xpReward: z.number().int().min(0).max(1000).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

const taskPatchSchema = taskCreateSchema.partial();

/**
 * TEST QUESTION DTO
 */
const questionCreateSchema = z.object({
  type: z.enum(['SINGLE', 'MULTI']).optional(),
  questionKz: z.string().min(1),
  questionRu: z.string().min(1),
  options: z.any(),        // Json
  correctAnswer: z.any(),  // Json
  orderIndex: z.number().int().min(0).optional(),
});

const questionPatchSchema = questionCreateSchema.partial();

/**
 * CONTROLLERS
 */
exports.createTopic = async (req, res, next) => {
  try {
    const data = topicCreateSchema.parse(req.body);
    const topic = await service.createTopic(data);
    res.status(201).json({ topic });
  } catch (err) {
    next(err);
  }
};

exports.updateTopic = async (req, res, next) => {
  try {
    const data = topicPatchSchema.parse(req.body);
    const topic = await service.updateTopic(req.params.id, data);
    res.json({ topic });
  } catch (err) {
    next(err);
  }
};

exports.createLessonForTopic = async (req, res, next) => {
  try {
    const data = lessonCreateSchema.parse(req.body);
    const lesson = await service.createLessonForTopic(req.params.id, data);
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const data = lessonPatchSchema.parse(req.body);
    const lesson = await service.updateLesson(req.params.id, data);
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};

exports.createTaskForTopic = async (req, res, next) => {
  try {
    const data = taskCreateSchema.parse(req.body);
    const task = await service.createTaskForTopic(req.params.id, data);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const data = taskPatchSchema.parse(req.body);
    const task = await service.updateTask(req.params.id, data);
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.createTestForTopic = async (req, res, next) => {
  try {
    const test = await service.createTestForTopic(req.params.id);
    res.status(201).json({ test });
  } catch (err) {
    next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const data = questionCreateSchema.parse(req.body);
    const question = await service.createQuestion(req.params.id, data);
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const data = questionPatchSchema.parse(req.body);
    const question = await service.updateQuestion(req.params.id, data);
    res.json({ question });
  } catch (err) {
    next(err);
  }
};