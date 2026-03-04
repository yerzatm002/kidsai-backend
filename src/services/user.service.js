const prisma = require('../utils/prisma');

async function createUser(data) {
  return prisma.user.create({ data });
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}



module.exports = { createUser, getUserById };