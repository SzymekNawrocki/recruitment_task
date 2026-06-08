import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { mssqlConfigFromUrl } from '../lib/db-config'

const adapter = new PrismaMssql(mssqlConfigFromUrl(process.env.DATABASE_URL))
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.catalogItem.deleteMany()

  await prisma.catalogItem.createMany({
    data: [
      { name: 'Mysz optyczna Logitech MX Master 3', category: 'Peryferia', unitValue: 399 },
      { name: 'Klawiatura mechaniczna Keychron K2', category: 'Peryferia', unitValue: 449 },
      { name: 'Monitor 24" Full HD Dell', category: 'Monitory', unitValue: 799 },
      { name: 'Monitor 27" 4K LG', category: 'Monitory', unitValue: 1499 },
      { name: 'Słuchawki z mikrofonem Sony WH-1000XM5', category: 'Audio', unitValue: 1299 },
      { name: 'Stacja dokująca USB-C Anker 13-in-1', category: 'Akcesoria', unitValue: 699 },
      { name: 'Kamera internetowa Logitech C920 HD', category: 'Peryferia', unitValue: 349 },
      { name: 'Podstawka pod laptopa Nexstand K2', category: 'Ergonomia', unitValue: 199 },
      { name: 'Podkładka pod mysz XL', category: 'Peryferia', unitValue: 79 },
      { name: 'Hub USB 4-portowy', category: 'Akcesoria', unitValue: 89 },
      { name: 'Kabel HDMI 2m', category: 'Akcesoria', unitValue: 39 },
      { name: 'Zasilacz UPS 650VA', category: 'Zasilanie', unitValue: 299 },
    ],
  })

  console.log('Seed complete: 12 catalog items created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
