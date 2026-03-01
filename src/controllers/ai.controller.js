const { z } = require('zod');
const aiService = require('../services/ai.service');

const schema = z.object({
  topicId: z.string().min(1),
  mode: z.enum(['explain', 'hint', 'quiz']).optional(),
  lang: z.enum(['kz', 'ru']).default('ru'),
  question: z.string().min(2).max(800),
});

exports.help = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = schema.parse(req.body);

    const result = await aiService.help({
      userId,
      topicId: body.topicId,
      mode: body.mode || 'explain',
      lang: body.lang,
      question: body.question,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};