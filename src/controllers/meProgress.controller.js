const { resolveLang } = require('../utils/lang');
const prisma = require('../utils/prisma');
const meService = require('../services/me.service');

exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lang = resolveLang(req.query.lang);

    const { topics, progressMap, viewedTopicIds } = await meService.getMeProgress(userId);

    // Для диаграммы полезно знать totalTasks по теме:
    // считаем задач в теме (для percent). Это 1 запрос с groupBy.
    const taskCounts = await prisma.task.groupBy({
      by: ['topicId'],
      _count: { _all: true },
    });
    const taskCountMap = new Map(taskCounts.map(r => [r.topicId, r._count._all]));

    const items = topics.map(t => {
      const p = progressMap.get(t.id);

      const totalTasks = taskCountMap.get(t.id) || 0;
      const tasksCompleted = p?.tasksCompleted || 0;

      return {
        topicId: t.id,
        title: lang === 'ru' ? t.titleRu : t.titleKz,
        coverImageUrl: t.coverImageUrl,
        orderIndex: t.orderIndex,

        lessonViewed: viewedTopicIds.has(t.id),
        tasksCompleted,
        totalTasks,
        tasksProgressPercent: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0,

        bestTestScore: p?.bestTestScore || 0,
        completedAt: p?.completedAt || null,
        updatedAt: p?.updatedAt || null,
      };
    });

    res.json({ lang, items });
  } catch (err) {
    next(err);
  }
};