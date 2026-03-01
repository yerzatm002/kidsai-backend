const prisma = require('../utils/prisma');
const { hashPassword, verifyPassword } = require('../utils/password');
const { sha256 } = require('../utils/crypto');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const refreshTokenService = require('./refreshToken.service');

function refreshExpiryDate() {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 14);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function register({ email, password, fullName, role, grade }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role,
      grade: role === 'STUDENT' ? (grade ?? null) : null,
    },
    select: { id: true, email: true, fullName: true, role: true, grade: true },
  });

  return user;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await refreshTokenService.saveRefreshToken({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshExpiryDate(),
  });

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, grade: user.grade },
    accessToken,
    refreshToken,
  };
}

async function refresh({ refreshToken }) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = sha256(refreshToken);
  const record = await refreshTokenService.findRefreshToken(tokenHash);

  if (!record || record.revokedAt) {
    const err = new Error('Refresh token revoked or not found');
    err.statusCode = 401;
    throw err;
  }

  if (record.expiresAt < new Date()) {
    const err = new Error('Refresh token expired');
    err.statusCode = 401;
    throw err;
  }

  // Опционально: ротация refresh (для MVP можно не делать)
  const accessToken = signAccessToken({ sub: decoded.sub, role: decoded.role });

  return { accessToken };
}

module.exports = { register, login, refresh };