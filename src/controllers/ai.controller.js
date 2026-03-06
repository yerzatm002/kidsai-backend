const { z } = require("zod");
const aiService = require("../services/ai.service");

const schema = z.object({
  topicId: z.string(),
  lang: z.enum(["kz", "ru"]),
  mode: z.enum(["explain", "hint", "quiz"]),
  question: z.string().min(1),
  lessonSnippet: z.string().min(1).max(8000),
});

exports.help = async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const result = await aiService.help(body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};