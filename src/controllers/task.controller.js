const { resolveLang } = require('../utils/lang');
const taskAttemptService = require('../services/taskAttempt.service');

exports.listTopicTasks = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id: topicId } = req.params;

    const tasks = await taskAttemptService.listTasksByTopic(topicId);

    res.json({
      lang,
      topicId,
      items: tasks.map(t => ({
        id: t.id,
        topicId: t.topicId,
        type: t.type,
        prompt: lang === 'ru' ? t.promptRu : t.promptKz,
        payload: t.payload, // см. примечание ниже о "не отдавать correct"
        xpReward: t.xpReward,
        orderIndex: t.orderIndex,
      })),
    });
  } catch (err) {
    next(err);
  }
};