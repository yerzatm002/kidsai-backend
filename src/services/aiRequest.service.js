const prisma = require('../utils/prisma');
const achievementService = require('./achievement.service');

async function recordAIRequest(userId) {
  await prisma.aIRequest.create({ data: { userId } });
  return achievementService.evaluateAndAward(userId);
}

module.exports = { recordAIRequest };