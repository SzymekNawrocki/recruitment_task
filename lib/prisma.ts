import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { mssqlConfigFromUrl } from '@/lib/db-config'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaMssql(mssqlConfigFromUrl(process.env.DATABASE_URL))
  return new PrismaClient({ adapter })
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Lazy proxy: the real client is constructed only on first property access
// (at request time, when DATABASE_URL is available) — never during the build.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
