const { z } = require('zod');
const { resolveLang } = require('../utils/lang');
const svc = require('../services/teacherStudents.service');

const listQuerySchema = z.object({
  grade: z.coerce.number().int().min(1).max(12).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

exports.listStudents = async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const page = q.page || 1;
    const pageSize = q.pageSize || 20;

    const data = await svc.listStudents({
      grade: q.grade,
      page,
      pageSize,
    });

    res.json({ page, pageSize, total: data.total, items: data.items });
  } catch (err) {
    next(err);
  }
};

exports.getStudentProgress = async (req, res, next) => {
  try {
    const lang = resolveLang(req.query.lang);
    const { id: studentId } = req.params;

    const data = await svc.getStudentProgress({ studentId });

    const items = data.topics.map(t => {
      const p = data.progressMap.get(t.id);
      const totalTasks = data.taskCountMap.get(t.id) || 0;
      const tasksCompleted = p?.tasksCompleted || 0;

      return {
        topicId: t.id,
        title: lang === 'ru' ? t.titleRu : t.titleKz,
        orderIndex: t.orderIndex,
        coverImageUrl: t.coverImageUrl,

        lessonViewed: data.viewedTopicIds.has(t.id),
        tasksCompleted,
        totalTasks,
        tasksProgressPercent: totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0,

        bestTestScore: p?.bestTestScore || 0,
        completedAt: p?.completedAt || null,
        updatedAt: p?.updatedAt || null,
      };
    });

    res.json({
      lang,
      student: {
        id: data.student.id,
        email: data.student.email,
        fullName: data.student.fullName,
        grade: data.student.grade,
        createdAt: data.student.createdAt,
        totalXp: data.student.stats?.totalXp ?? 0,
        level: data.student.stats?.level ?? 1,
      },
      aggregates: data.aggregates,
      items,
    });
  } catch (err) {
    next(err);
  }
};