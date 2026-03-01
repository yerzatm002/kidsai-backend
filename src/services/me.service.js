const prisma = require('../utils/prisma');

async function getMeProgress(userId) {
  // 1) все темы (для списка/диаграммы)
  const topics = await prisma.topic.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      titleKz: true,
      titleRu: true,
      coverImageUrl: true,
      orderIndex: true,
    },
  });

  // 2) прогресс по темам
  const progressRows = await prisma.userTopicProgress.findMany({
    where: { userId },
    select: {
      topicId: true,
      tasksCompleted: true,
      bestTestScore: true,
      completedAt: true,
      updatedAt: true,
    },
  });

  const progressMap = new Map(progressRows.map(p => [p.topicId, p]));

  // 3) факт просмотра урока: считаем "просмотрена тема", если есть хотя бы один LessonView по урокам этой темы
  const lessonViewsByTopic = await prisma.lessonView.findMany({
    where: { userId },
    select: { lesson: { select: { topicId: true } } },
  });

  const viewedTopicIds = new Set(lessonViewsByTopic.map(v => v.lesson.topicId));

  return { topics, progressMap, viewedTopicIds };
}

async function getMeDashboard(userId) {
  const stats = await prisma.userStats.upsert({
    where: { userId },
    update: {},
    create: { userId, totalXp: 0, level: 1 },
    select: { totalXp: true, level: true },
  });

  const badgesCount = await prisma.userBadge.count({ where: { userId } });

  const completedTopics = await prisma.userTopicProgress.count({
    where: { userId, completedAt: { not: null } },
  });

  return { stats, badgesCount, completedTopics };
}

module.exports = { getMeProgress, getMeDashboard };