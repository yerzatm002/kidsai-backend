const { resolveLang } = require('../utils/lang');
const testService = require('../services/test.service');

exports.getTopicTest = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id: topicId } = req.params;

    const test = await testService.getTestByTopicId(topicId);
    if (!test) return res.status(404).json({ error: 'Test not found for this topic' });

    // ВАЖНО: без correctAnswer
    const questions = test.questions.map(q => ({
      id: q.id,
      type: q.type,
      question: lang === 'ru' ? q.questionRu : q.questionKz,
      options: q.options,
      orderIndex: q.orderIndex,
    }));

    res.json({
      lang,
      topicId,
      test: { id: test.id, topicId: test.topicId },
      questions,
    });
  } catch (err) {
    next(err);
  }
};