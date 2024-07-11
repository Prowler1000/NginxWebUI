import { PrismaClient } from "@prisma/client";
import data from "../data.json" assert { type: "json" }

const prisma = new PrismaClient();
async function main() {
    console.log("Seeding started.");

    console.log("Seeding Headers..");
    for (const headers of data.headers) {
        const header = await prisma.header.create({
            data: {
                name: headers.name,
                value: headers.value,
            }
        })
        console.log(`Created header '${header.name}' with id: ${header.id}`);
    }
    console.log("Seeding Servers..");
    for (const servers of data.servers) {
        const server = await prisma.server.create({
            data: {
                name: servers.name,
                hostname: servers.hostname,
                http_port: servers.http_port,
                ssl_port: servers.ssl_port,
                use_ssl: servers.use_ssl
            }
        })
        console.log(`Created server '${server.name}'`);
        for (const headerName of servers.headers) {
            const header = await prisma.header.findFirst({where: {name: headerName}});
            if (header) {
                const serverHeader = await prisma.serverHeader.create({
                    data: {
                        headerId: header.id,
                        serverId: server.id,
                    }
                })
                console.log(`Added header id '${serverHeader.headerId}' to ${server.name}`);
            }
        }
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