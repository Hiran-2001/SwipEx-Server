"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({});
async function main() {
    const categories = [
        { category_name: 'Electronics' },
        { category_name: 'Mobiles' },
        { category_name: 'Furniture' },
        { category_name: 'Vehicles' },
        { category_name: 'Fashion' },
        { category_name: 'Books' },
        { category_name: 'Pets' },
        { category_name: 'Sports' },
    ];
    console.log('Seeding categories...');
    for (const category of categories) {
        const existing = await prisma.category.findFirst({
            where: { category_name: category.category_name },
        });
        if (!existing) {
            await prisma.category.create({
                data: category,
            });
            console.log(`Created category: ${category.category_name}`);
        }
        else {
            console.log(`Category already exists: ${category.category_name}`);
        }
    }
    console.log('Seeding finished.');
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