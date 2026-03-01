const prisma = require('../utils/prisma');
const { resolveLang } = require('../utils/lang');
const { calcLevel } = require('../utils/level');

exports.getMyBadges = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const userId = req.user.id;

    const items = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'asc' },
      include: { badge: true },
    });

    res.json({
      lang,
      items: items.map(ub => ({
        code: ub.badge.code,
        title: lang === 'ru' ? ub.badge.titleRu : ub.badge.titleKz,
        description: lang === 'ru' ? ub.badge.descriptionRu : ub.badge.descriptionKz,
        iconUrl: ub.badge.iconUrl,
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // если вдруг stats ещё не созданы
    const stats = await prisma.userStats.upsert({
      where: { userId },
      update: {},
      create: { userId, totalXp: 0, level: 1 },
    });

    // на всякий случай пересчитаем уровень из totalXp (устойчиво)
    const level = calcLevel(stats.totalXp);
    const updated = level !== stats.level
      ? await prisma.userStats.update({ where: { userId }, data: { level } })
      : stats;

    res.json({ stats: updated });
  } catch (err) {
    next(err);
  }
};