const { z } = require('zod');
const { hashPassword } = require('../utils/password');
const userService = require('../services/user.service');

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['STUDENT', 'TEACHER']).optional(),
  grade: z.number().int().min(1).max(12).optional(),
});

exports.createUserDebug = async (req, res, next) => {
  try {
    const parsed = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(parsed.password);

    const user = await userService.createUser({
      email: parsed.email,
      passwordHash,
      fullName: parsed.fullName,
      role: parsed.role || 'STUDENT',
      grade: parsed.grade ?? null,
    });

    // В debug-эндпоинте возвращаем минимум (без passwordHash)
    res.status(201).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      grade: user.grade,
      createdAt: user.createdAt,
    });
  } catch (err) {
    // zod throws exceptions; forward to error handler
    next(err);
  }
};

exports.getUserDebug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      grade: user.grade,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};