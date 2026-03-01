const prisma = require('../utils/prisma');

async function saveRefreshToken({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

async function findRefreshToken(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

async function revokeRefreshToken(tokenHash) {
  return prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}

module.exports = { saveRefreshToken, findRefreshToken, revokeRefreshToken };