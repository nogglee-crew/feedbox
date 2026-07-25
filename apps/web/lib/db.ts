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

let client: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (client) return client;
  client = globalForPrisma.feedboxPrisma ?? createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.feedboxPrisma = client;
  }
  return client;
}

/**
 * 첫 사용 시점까지 생성을 미룬다.
 * next build의 page data 수집 단계가 이 모듈을 import하는데,
 * 빌드는 DB에 접근하지 않으므로 연결 문자열을 요구해서는 안 된다.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const value = Reflect.get(getPrismaClient(), property) as unknown;
    return typeof value === "function" ? value.bind(getPrismaClient()) : value;
  },
});
