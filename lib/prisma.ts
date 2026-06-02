import path from 'path'
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function resolveDbUrl(raw: string | undefined): string {
  const rel = raw?.startsWith('file:./') ? raw.slice(5) : './dev.db'
  return `file:${path.resolve(rel).split('\\').join('/')}`
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: resolveDbUrl(process.env.DATABASE_URL) })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
