const prisma = require('../utils/prisma');
const achievementService = require('../services/achievement.service');

exports.markLessonViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: lessonId } = req.params;

    // создаём view (уникально по userId+lessonId)
    try {
      await prisma.lessonView.create({ data: { userId, lessonId } });
    } catch (e) {
      if (e.code !== 'P2002') throw e; // уже есть view — ок
    }

    const awarded = await achievementService.evaluateAndAward(userId);

    res.status(201).json({
      ok: true,
      awardedBadges: awarded.map(ub => ({ code: ub.badge.code })),
    });
  } catch (err) {
    next(err);
  }
};