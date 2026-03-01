const prisma = require('../utils/prisma');
const { checkTask } = require('./taskChecker.service');
const { calcLevel } = require('../utils/level');
const achievementService = require('./achievement.service');

async function listTasksByTopic(topicId) {
  return prisma.task.findMany({
    where: { topicId },
    orderBy: { orderIndex: 'asc' },
  });
}

/**
 * Anti-farm: XP только за первую правильную попытку
 */
async function hasPriorCorrectAttempt(userId, taskId) {
  const found = await prisma.taskAttempt.findFirst({
    where: { userId, taskId, isCorrect: true },
    select: { id: true },
  });
  return !!found;
}

/**
 * Ensure UserStats exists
 */
async function ensureUserStats(userId) {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  if (stats) return stats;
  return prisma.userStats.create({ data: { userId, totalXp: 0, level: 1 } });
}

async function ensureTopicProgress(userId, topicId) {
  const progress = await prisma.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  if (progress) return progress;

  return prisma.userTopicProgress.create({
    data: { userId, topicId, tasksCompleted: 0, bestTestScore: 0 },
  });
}

async function submitAttempt({ userId, taskId, answerPayload }) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const isCorrect = checkTask(task.type, task.payload, answerPayload);

  const alreadySolved = isCorrect ? await hasPriorCorrectAttempt(userId, taskId) : false;
  const earnedXp = isCorrect && !alreadySolved ? (task.xpReward || 0) : 0;

  /**
   * Транзакция: записать attempt + обновить stats + прогресс
   */
  const result = await prisma.$transaction(async (tx) => {
    // 1) attempt
    const attempt = await tx.taskAttempt.create({
      data: {
        userId,
        taskId,
        answerPayload,
        isCorrect,
        earnedXp,
      },
    });
  


    // 2) stats
    const stats = await tx.userStats.upsert({
      where: { userId },
      update: {
        totalXp: { increment: earnedXp },
      },
      create: {
        userId,
        totalXp: earnedXp,
        level: 1,
      },
    });

    // пересчёт level
    const newTotalXp = stats.totalXp;
    const newLevel = calcLevel(newTotalXp);

    const updatedStats = await tx.userStats.update({
      where: { userId },
      data: { level: newLevel },
    });

    // 3) progress
    await ensureTopicProgress(userId, task.topicId);

    // tasksCompleted увеличиваем только если это первая правильная попытка
    let updatedProgress = await tx.userTopicProgress.findUnique({
      where: { userId_topicId: { userId, topicId: task.topicId } },
    });

    if (isCorrect && !alreadySolved) {
      updatedProgress = await tx.userTopicProgress.update({
        where: { userId_topicId: { userId, topicId: task.topicId } },
        data: {
          tasksCompleted: { increment: 1 },
        },
      });
    }

    return { attempt, updatedStats, updatedProgress, task };
  });

  
  const awarded = await achievementService.evaluateAndAward(userId);

  return {
    taskId,
    topicId: result.task.topicId,
    isCorrect: result.attempt.isCorrect,
    earnedXp: result.attempt.earnedXp,
    alreadySolved,
    stats: result.updatedStats,
    progress: result.updatedProgress,
    awardedBadges: awarded.map(ub => ({ code: ub.badge.code })),
  };
}

module.exports = { listTasksByTopic, submitAttempt };