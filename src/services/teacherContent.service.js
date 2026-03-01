const prisma = require('../utils/prisma');

/**
 * TOPICS
 */
async function createTopic(data) {
  return prisma.topic.create({ data });
}

async function updateTopic(id, data) {
  return prisma.topic.update({ where: { id }, data });
}

/**
 * LESSONS
 * По ТЗ: POST /topics/:id/lesson (создать урок для темы)
 */
async function createLessonForTopic(topicId, data) {
  // гарантируем, что тема существует
  await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  return prisma.lesson.create({
    data: { topicId, ...data },
  });
}

async function updateLesson(id, data) {
  return prisma.lesson.update({ where: { id }, data });
}

/**
 * TASKS
 */
async function createTaskForTopic(topicId, data) {
  await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  return prisma.task.create({
    data: { topicId, ...data },
  });
}

async function updateTask(id, data) {
  return prisma.task.update({ where: { id }, data });
}

/**
 * TESTS
 * По ТЗ: один тест на тему
 */
async function createTestForTopic(topicId) {
  await prisma.topic.findUniqueOrThrow({ where: { id: topicId } });

  // если тест уже есть — вернём конфликт
  const existing = await prisma.test.findUnique({ where: { topicId } });
  if (existing) {
    const err = new Error('Test already exists for this topic');
    err.statusCode = 409;
    throw err;
  }

  return prisma.test.create({ data: { topicId } });
}

async function createQuestion(testId, data) {
  await prisma.test.findUniqueOrThrow({ where: { id: testId } });

  return prisma.testQuestion.create({
    data: { testId, ...data },
  });
}

async function updateQuestion(id, data) {
  return prisma.testQuestion.update({ where: { id }, data });
}

module.exports = {
  createTopic,
  updateTopic,
  createLessonForTopic,
  updateLesson,
  createTaskForTopic,
  updateTask,
  createTestForTopic,
  createQuestion,
  updateQuestion,
};