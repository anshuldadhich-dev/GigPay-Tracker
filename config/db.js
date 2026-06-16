const { PrismaClient } = require("../generated/prisma-client/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Pre-warm DB connection at startup so first request isn't slow
prisma.$connect().catch((err) => {
  console.warn("DB pre-connect failed (will retry on first query):", err.message);
});

module.exports = prisma;
