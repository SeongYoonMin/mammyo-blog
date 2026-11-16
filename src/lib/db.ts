import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// pg는 sslmode=require를 이미 verify-full로 처리하지만 향후 변경 경고를 낸다.
// 같은 동작을 명시해 경고를 없애고, pg v9 이후에도 인증서 검증을 유지한다.
const connectionString = process.env.DATABASE_URL!.replace(/sslmode=require\b/, "sslmode=verify-full");

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
