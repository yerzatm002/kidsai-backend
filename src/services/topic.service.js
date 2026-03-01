const prisma = require('../utils/prisma');

async function listTopics({ skip = 0, take = 100 }) {
  return prisma.topic.findMany({
    orderBy: { orderIndex: 'asc' },
    skip,
    take,
  });
}

async function getTopicById(id) {
  return prisma.topic.findUnique({
    where: { id },
  });
}

async function getLessonByTopicId(topicId) {
  // если по ТЗ 1 урок на тему — берём первый по orderIndex
  return prisma.lesson.findFirst({
    where: { topicId },
    orderBy: { orderIndex: 'asc' },
  });
}

// если вы хотите в будущем много уроков на тему:
async function listLessonsByTopicId(topicId) {
  return prisma.lesson.findMany({
    where: { topicId },
    orderBy: { orderIndex: 'asc' },
  });
}

module.exports = { listTopics, getTopicById, getLessonByTopicId, listLessonsByTopicId };