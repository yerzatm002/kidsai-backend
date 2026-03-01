const prisma = require('../utils/prisma');
const { gradeTest } = require('./testGrader.service');
const { calcLevel } = require('../utils/level');
const achievementService = require('./achievement.service');

function calcTestXp(score, maxScore) {
  if (maxScore <= 0) return 0;
  const base = Math.floor((score / maxScore) * 50);
  const bonus = score === maxScore ? 10 : 0;
  return base + bonus;
}

async function ensureUserStats(tx, userId) {
  const stats = await tx.userStats.findUnique({ where: { userId } });
  if (stats) return stats;
  return tx.userStats.create({ data: { userId, totalXp: 0, level: 1 } });
}

async function ensureTopicProgress(tx, userId, topicId) {
  const progress = await tx.userTopicProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  if (progress) return progress;
  return tx.userTopicProgress.create({
    data: { userId, topicId, tasksCompleted: 0, bestTestScore: 0 },
  });
}

/**
 * Anti-farm: начисляем XP только если улучшили bestTestScore.
 */
async function submitTestAttempt({ userId, testId, answers }) {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!test) {
    const err = new Error('Test not found');
    err.statusCode = 404;
    throw err;
  }

  const { score, maxScore, review } = gradeTest(test.questions, answers);

  const result = await prisma.$transaction(async (tx) => {
    const progress = await ensureTopicProgress(tx, userId, test.topicId);
    await ensureUserStats(tx, userId);

    const improved = score > (progress.bestTestScore || 0);
    const earnedXp = improved ? calcTestXp(score, maxScore) : 0;

    // 1) save attempt
    await tx.testAttempt.create({
      data: {
        userId,
        testId,
        answers,
        score,
        maxScore,
        earnedXp,
      },
    });

    // 2) update best score
    const updatedProgress = improved
      ? await tx.userTopicProgress.update({
          where: { userId_topicId: { userId, topicId: test.topicId } },
          data: { bestTestScore: score },
        })
      : progress;

    // 3) update stats XP + level
    const stats = await tx.userStats.update({
      where: { userId },
      data: { totalXp: { increment: earnedXp } },
    });

    const newLevel = calcLevel(stats.totalXp);
    const updatedStats = await tx.userStats.update({
      where: { userId },
      data: { level: newLevel },
    });

    return {
      topicId: test.topicId,
      score,
      maxScore,
      earnedXp,
      improved,
      updatedProgress,
      updatedStats,
    };
  });

  const awarded = await achievementService.evaluateAndAward(userId);

  return {
    testId,
    topicId: result.topicId,
    score: result.score,
    maxScore: result.maxScore,
    earnedXp: result.earnedXp,
    improvedBest: result.improved,
    progress: result.updatedProgress,
    stats: result.updatedStats,
    review,
    awardedBadges: awarded.map(ub => ({ code: ub.badge.code })),
  };
}

module.exports = { submitTestAttempt };