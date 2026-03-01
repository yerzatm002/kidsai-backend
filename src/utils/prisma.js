const { PrismaClient } = require("@prisma/client");
const { neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global;

function makeClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing in .env");

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma || makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;