const prisma = require('../utils/prisma');

async function listStudents({ grade, page = 1, pageSize = 20 }) {
  const skip = (page - 1) * pageSize;
  const where = {
    role: 'STUDENT',
    ...(typeof grade === 'number' ? { grade } : {}),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ grade: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        fullName: true,
        grade: true,
        stats: { select: { totalXp: true, level: true } },
        userBadges: { select: { id: true } }, // count via length
      },
    }),
  ]);

  return {
    total,
    items: users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      grade: u.grade,
      totalXp: u.stats?.totalXp ?? 0,
      level: u.stats?.level ?? 1,
      badgesCount: u.userBadges.length,
    })),
  };
}

async function getStudentProgress({ studentId }) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      grade: true,
      createdAt: true,
      stats: { select: { totalXp: true, level: true } },
    },
  });

  if (!student || student.role !== 'STUDENT') {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const topics = await prisma.topic.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      titleKz: true,
      titleRu: true,
      orderIndex: true,
      coverImageUrl: true,
    },
  });

  const progressRows = await prisma.userTopicProgress.findMany({
    where: { userId: studentId },
    select: {
      topicId: true,
      tasksCompleted: true,
      bestTestScore: true,
      completedAt: true,
      updatedAt: true,
    },
  });
  const progressMap = new Map(progressRows.map(p => [p.topicId, p]));

  const taskCounts = await prisma.task.groupBy({
    by: ['topicId'],
    _count: { _all: true },
  });
  const taskCountMap = new Map(taskCounts.map(r => [r.topicId, r._count._all]));

  // lessonViewed per topic: есть ли просмотр любого урока темы
  const lessonViews = await prisma.lessonView.findMany({
    where: { userId: studentId },
    select: { lesson: { select: { topicId: true } } },
  });
  const viewedTopicIds = new Set(lessonViews.map(v => v.lesson.topicId));

  // агрегаты активности (опционально полезно)
  const [taskAttemptsCount, testAttemptsCount, badgesCount] = await prisma.$transaction([
    prisma.taskAttempt.count({ where: { userId: studentId } }),
    prisma.testAttempt.count({ where: { userId: studentId } }),
    prisma.userBadge.count({ where: { userId: studentId } }),
  ]);

  return {
    student,
    topics,
    progressMap,
    taskCountMap,
    viewedTopicIds,
    aggregates: {
      taskAttemptsCount,
      testAttemptsCount,
      badgesCount,
    },
  };
}

module.exports = { listStudents, getStudentProgress };