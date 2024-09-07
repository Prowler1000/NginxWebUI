import { test, expect } from "@playwright/test";
import type { Server } from "@prisma/client";

test.use({
    baseURL: "http://localhost:4173",
})

const TestServer = {
    enable: false,
    name: "Playwright Test Server",
    hostname: "playwright_test_server.example.com",
    http_port: 80,
    ssl_port: 443,
    use_ssl: true,
    authId: null,
    sSLConfigId: null,
}

test('should create a server', async ({ request }) => {
    const newServer = await request.post(`/api/v1/servers/Create`, {
        data: {
            id: 10,
            ...TestServer
        }
    });
    expect(newServer.ok()).toBeTruthy();
})

test('Should grab created server', async ({ request }) => {
    const grabbedServer = await request.get(`/api/v1/servers/Get`);
    expect(grabbedServer.ok()).toBeTruthy();
    expect(await grabbedServer.json()).toEqual(
        expect.arrayContaining([
            expect.objectContaining(TestServer)
        ])
    );
})

test('Should delete created server', async ({ request }) => {
    const servers = await request.get(`/api/v1/servers/Get`);
    const filtered = (await servers.json() as Server[]).filter(x => {
        return Object.keys(TestServer).every(key => 
            x[key as keyof Server] === TestServer[key as keyof typeof TestServer]
        )
    });
    const deleteReq = await request.delete(`/api/v1/servers/Delete`, {
        data: {
            id: filtered[0].id
        }
    });
    expect(deleteReq.ok()).toBeTruthy();
})

test('Should not grab deleted server', async ({ request }) => {
    const servers = await request.get(`/api/v1/servers/Get`);
    expect(servers.ok()).toBeTruthy();
    expect(await servers.json()).not.toEqual(
        expect.arrayContaining([
            expect.objectContaining(TestServer)
        ])
    );
})

test.afterAll(async ({ request }) => {
    const res = await request.get(`/api/v1/servers/Get`);
    expect(res.ok()).toBeTruthy();
    const servers = await res.json() as Server[];
    const filtered = servers.filter(x => {
        return Object.keys(TestServer).every(key => 
            x[key as keyof Server] === TestServer[key as keyof typeof TestServer]
        )
    });
    if (filtered.length > 0) {
        await request.delete(`/api/v1/servers/Delete`, {
            data: {
                id: filtered[0].id,
            }
        });

    }
})