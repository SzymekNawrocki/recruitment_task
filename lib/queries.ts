import { prisma } from './prisma'

export async function getCatalog() {
  return prisma.catalogItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
}

export async function getOrders() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
}
