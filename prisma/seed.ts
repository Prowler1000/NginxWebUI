import { PrismaClient } from "@prisma/client";
import headerData from "../data.json" assert { type: "json" }

const prisma = new PrismaClient();
async function main() {
    console.log("Seeding started.");

    for (const h of headerData) {
        const header = await prisma.header.create({
            data: {
                name: h.name,
                value: h.value,
            }
        });
        console.log(`Created header with id: ${header.id}`);
    }
    console.log("Seeding finished.");
}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})