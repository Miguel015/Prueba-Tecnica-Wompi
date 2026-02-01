"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({
    adapter,
});
async function main() {
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
//# sourceMappingURL=seed.js.map