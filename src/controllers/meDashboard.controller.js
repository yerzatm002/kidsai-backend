const { resolveLang } = require('../utils/lang');
const meService = require('../services/me.service');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lang = resolveLang(req.query.lang); // если фронт захочет локализовать подписи

    const { stats, badgesCount, completedTopics } = await meService.getMeDashboard(userId);

    // Для диаграммы фронту удобнее уже готовый progress per topic
    // Можно просто дернуть те же данные, но без лишних полей.
    // Чтобы не делать 2 отдельных запроса с клиента — даём небольшой summary массив.
    // (Если хотите — можно переиспользовать getMeProgress и нарезать.)
    // Здесь минимально: completedTopics уже есть, остальное для диаграммы возьмем в /me/progress.

    res.json({
      lang,
      totalXp: stats.totalXp,
      level: stats.level,
      badgesCount,
      completedTopics,
    });
  } catch (err) {
    next(err);
  }
};