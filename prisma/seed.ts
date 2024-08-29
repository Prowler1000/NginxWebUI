import { PrismaClient, Scheme } from "@prisma/client";
import seed from "./seed.json" assert { type: "json" }

const prisma = new PrismaClient();
async function main() {
    console.log("Seeding started.");
    console.log("Seeding auths...");
    for (const authSeed of seed.auths) {
        const locations: {prefix: string, location: string, directives: string[]}[] = [];
        for (const location of authSeed.locations) {
            locations.push({
                prefix: location.prefix,
                location: location.location,
                directives: location.directives,
            })
        };
        const auth = await prisma.auth.create({
            data: {
                name: authSeed.name,
                auth_request: authSeed.auth_request,
                auth_request_headers: authSeed.auth_request_headers,
                proxy_headers: authSeed.proxy_headers,
                locations: {
                    create: locations
                }
            }
        });
        console.log(`Created auth ${auth.name} with ID ${auth.id} and associated locations.`);
    }
    console.log("Seeding servers...");
    for (const seedProxy of seed.proxy_servers) {
        const auth = seedProxy.auth ? await prisma.auth.findFirst({
            where: {
                name: seedProxy.auth
            }
        }) : undefined;
        const server = await prisma.server.create({
            data: {
                name: seedProxy.server.name,
                hostname: seedProxy.server.hostname,
                http_port: seedProxy.server.http_port,
                ssl_port: seedProxy.server.ssl_port,
                use_ssl: true,
                authId: auth?.id
            }
        });
        const proxy = await prisma.proxyServer.create({
            data: {
                forward_scheme: Scheme[seedProxy.forward_scheme],
                forward_server: seedProxy.forward_server,
                forward_port: seedProxy.forward_port,
                serverId: server.id,
            }
        })
        console.log(`Created proxy server with ID ${proxy.id} and associated server with ID ${server.id}`);
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