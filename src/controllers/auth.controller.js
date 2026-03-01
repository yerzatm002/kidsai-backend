const { z } = require('zod');
const authService = require('../services/auth.service');
const { getRefreshCookieOptions } = require('../utils/cookies');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['STUDENT', 'TEACHER']),
  grade: z.number().int().min(1).max(12).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

exports.register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    if (data.role === 'STUDENT' && typeof data.grade !== 'number') {
      return res.status(400).json({ error: 'grade is required for STUDENT' });
    }

    const user = await authService.register(data);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    // refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Missing refresh token' });

    const { accessToken } = await authService.refresh({ refreshToken: token });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};