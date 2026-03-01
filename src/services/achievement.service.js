const prisma = require('../utils/prisma');

/**
 * Безопасная выдача: UserBadge имеет @@unique([userId,badgeId]),
 * поэтому повторные выдачи не пройдут.
 */
async function awardByCode(userId, code) {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return null;

  try {
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
      include: { badge: true },
    });
    return userBadge;
  } catch (e) {
    // P2002 = unique constraint violation => уже выдан
    if (e.code === 'P2002') return null;
    throw e;
  }
}

async function checkFIRST_LESSON(userId) {
  const views = await prisma.lessonView.count({ where: { userId } });
  return views >= 1;
}

async function checkTASK_CHAMPION(userId) {
  // считаем "правильно выполнено" как уникальные задачи, решённые верно
  const correctDistinct = await prisma.taskAttempt.findMany({
    where: { userId, isCorrect: true },
    select: { taskId: true },
    distinct: ['taskId'],
  });
  return correctDistinct.length >= 10;
}

async function checkTEST_MASTER(userId) {
  // 80%+ в 3 РАЗНЫХ тестах (берём лучший результат по каждому testId)
  const attempts = await prisma.testAttempt.findMany({
    where: { userId, maxScore: { gt: 0 } },
    select: { testId: true, score: true, maxScore: true },
  });

  const bestByTest = new Map();
  for (const a of attempts) {
    const ratio = a.maxScore > 0 ? a.score / a.maxScore : 0;
    const prev = bestByTest.get(a.testId);
    if (prev === undefined || ratio > prev) bestByTest.set(a.testId, ratio);
  }

  let count80 = 0;
  for (const ratio of bestByTest.values()) {
    if (ratio >= 0.8) count80 += 1;
  }
  return count80 >= 3;
}

async function checkAI_EXPLORER(userId) {
  const cnt = await prisma.aIRequest.count({ where: { userId } });
  return cnt >= 5;
}

/**
 * AI_SAFETY — если решите: можно выдавать, когда фронт вызывает endpoint
 * POST /api/me/ai-safety/confirm (или аналогичный). Здесь просто оставим проверку false.
 */
async function checkAI_SAFETY(userId) {
  // MVP: отключено, пока не добавите явный триггер
  return false;
}

/**
 * Универсальная проверка (после события)
 */
async function evaluateAndAward(userId) {
  const awarded = [];

  if (await checkFIRST_LESSON(userId)) {
    const ub = await awardByCode(userId, 'FIRST_LESSON');
    if (ub) awarded.push(ub);
  }

  if (await checkTASK_CHAMPION(userId)) {
    const ub = await awardByCode(userId, 'TASK_CHAMPION');
    if (ub) awarded.push(ub);
  }

  if (await checkTEST_MASTER(userId)) {
    const ub = await awardByCode(userId, 'TEST_MASTER');
    if (ub) awarded.push(ub);
  }

  if (await checkAI_EXPLORER(userId)) {
    const ub = await awardByCode(userId, 'AI_EXPLORER');
    if (ub) awarded.push(ub);
  }

  if (await checkAI_SAFETY(userId)) {
    const ub = await awardByCode(userId, 'AI_SAFETY');
    if (ub) awarded.push(ub);
  }

  return awarded;
}

module.exports = { evaluateAndAward, awardByCode };