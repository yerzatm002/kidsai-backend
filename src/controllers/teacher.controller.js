const { z } = require('zod');
const service = require('../services/teacherContent.service');
const prisma = require('../utils/prisma');

const TaskTypeEnum = z.enum(['SIMPLE', 'DRAG_DROP', 'QA']);
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
const taskItemSchema = z.object({
  type: TaskTypeEnum,
  promptKz: z.string().min(1),
  promptRu: z.string().min(1),
  payload: z.any().default({}), // можно усилить по типам позже
  xpReward: z.number().int().min(0).default(0),
});

const createTasksSchema = z.object({
  items: z.array(taskItemSchema).min(1),
});



/**
 * TEST QUESTION DTO
 */
const QuestionTypeEnum = z.enum(['SINGLE', 'MULTI', 'TEXT']); // если у вас только SINGLE — можно оставить z.literal('SINGLE')

const questionItemSchema = z.object({
  type: QuestionTypeEnum,
  promptKz: z.string().min(1),
  promptRu: z.string().min(1),
  options: z.array(z.string()).optional().default([]),
  correct: z.array(z.number().int()).optional().default([]),
  points: z.number().int().min(1).default(1),
});

const createQuestionsSchema = z.object({
  items: z.array(questionItemSchema).min(1),
});

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

exports.createTasksForTopic = async (req, res, next) => {
  try {
    const topicId = req.params.id;

    const body = createTasksSchema.parse(req.body);

    // (опционально) убедиться что тема существует
    const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true } });
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // создаём пачкой
    await prisma.task.createMany({
      data: body.items.map(it => ({
        topicId,
        type: it.type,
        promptKz: it.promptKz,
        promptRu: it.promptRu,
        payload: it.payload,
        xpReward: it.xpReward,
      })),
    });

    res.status(201).json({ created: body.items.length });
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

exports.createQuestions = async (req, res, next) => {
  try {
    const testId = req.params.id;

    const body = createQuestionsSchema.parse(req.body);

    // (опционально) проверить что test существует
    const test = await prisma.test.findUnique({ where: { id: testId }, select: { id: true } });
    if (!test) return res.status(404).json({ error: 'Test not found' });

    await prisma.testQuestion.createMany({
      data: body.items.map(q => ({
        testId,
        type: q.type,
        questionKz: q.promptKz,
        questionRu: q.promptRu,
        options: q.options,   // Json
        correctAnswer: q.correct,   // Json
        points: q.points,
      })),
    });

    res.status(201).json({ created: body.items.length });
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