const { z } = require('zod');
const svc = require('../services/feedback.service');

const createSchema = z.object({
  topicId: z.string().optional().nullable(),
  lessonId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  message: z.string().min(3).max(2000),
});

exports.create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = createSchema.parse(req.body);

    const fb = await svc.createFeedback({
      userId,
      topicId: body.topicId || null,
      lessonId: body.lessonId || null,
      rating: body.rating ?? null,
      message: body.message,
    });

    res.status(201).json({ feedback: fb });
  } catch (err) {
    next(err);
  }
};