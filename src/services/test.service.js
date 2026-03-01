const prisma = require('../utils/prisma');

async function getTestByTopicId(topicId) {
  return prisma.test.findUnique({
    where: { topicId },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
    },
  });
}

async function getTestWithQuestions(testId) {
  return prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  });
}

module.exports = { getTestByTopicId, getTestWithQuestions };