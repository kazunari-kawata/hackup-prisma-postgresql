// import 'server-only';
import { PrismaClient } from "../generated/prisma";

// グローバルにPrismaClientを保持するためのオブジェクト
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prismaインスタンスがあれば使う、なければ作成
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 開発環境でのみ使用
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
