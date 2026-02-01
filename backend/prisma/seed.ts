import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Seed de un producto de ejemplo con stock
  const product = await prisma.product.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Example Product',
      description: 'Example product for technical test.',
      price: 2000.0,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Example Product',
      description: 'Example product for technical test.',
      // Precio en COP: debe ser mayor a 1,500 para Wompi
      price: 2000.0,
      stock: {
        create: {
          quantity: 10,
          reservedQuantity: 0,
        },
      },
    },
  });

  console.log('Seeded product with id:', product.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
