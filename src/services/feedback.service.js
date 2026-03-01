const prisma = require('../utils/prisma');

async function createFeedback({ userId, topicId, lessonId, rating, message }) {
  return prisma.feedback.create({
    data: { userId, topicId, lessonId, rating, message },
  });
}

async function listFeedback({ page = 1, pageSize = 20, status, topicId }) {
  const skip = (page - 1) * pageSize;
  const where = {
    ...(status ? { status } : {}),
    ...(topicId ? { topicId } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true, grade: true } },
      },
    }),
  ]);

  return { total, items };
}

module.exports = { createFeedback, listFeedback };