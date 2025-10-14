import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Dev fallback: локально, если main_db_DATABASE_URL не задан, используем локальный PostgreSQL
if (process.env.NODE_ENV !== 'production' && !process.env.main_db_DATABASE_URL) {
  (process.env as any).main_db_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dndgenlab?schema=public';
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

