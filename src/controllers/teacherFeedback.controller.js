const { z } = require('zod');
const svc = require('../services/feedback.service');

const listSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  status: z.string().optional(),
  topicId: z.string().optional(),
});

exports.list = async (req, res, next) => {
  try {
    const q = listSchema.parse(req.query);
    const page = q.page || 1;
    const pageSize = q.pageSize || 20;

    const data = await svc.listFeedback({
      page,
      pageSize,
      status: q.status,
      topicId: q.topicId,
    });

    res.json({
      page,
      pageSize,
      total: data.total,
      items: data.items.map(x => ({
        id: x.id,
        message: x.message,
        rating: x.rating,
        status: x.status,
        topicId: x.topicId,
        lessonId: x.lessonId,
        createdAt: x.createdAt,
        user: {
          id: x.user.id,
          fullName: x.user.fullName,
          email: x.user.email,
          role: x.user.role,
          grade: x.user.grade,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
};