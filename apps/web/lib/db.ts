import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  feedboxPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Never fall back to localhost in production.
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL 환경변수가 필요합니다");
    }
    connectionString = "postgresql://feedbox:feedbox@127.0.0.1:5432/feedbox";
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma = globalForPrisma.feedboxPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.feedboxPrisma = prisma;
}
