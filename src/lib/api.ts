import { type Auth, type ProxyServer, type Server } from "@prisma/client"

export async function GetAllServers(fetchFunc = fetch): Promise<Server[]> {
    const res = await fetchFunc("api/v1/servers/Get-Servers");
    const json = await res.json();
    const serverArray: Server[] = json.map((server: Server) => {
        return {
            id: server.id,
            enable: server.enable,
            name: server.name,
            hostname: server.hostname,
            http_port: server.http_port,
            ssl_port: server.ssl_port,
            use_ssl: server.use_ssl
        }
    });
    return serverArray;
}

export async function GetAllProxyServers(fetchFunc = fetch): Promise<(Server & ProxyServer)[]> {
    const res = await fetchFunc('/api/v1/servers/Get-Proxies?includeServer=true');
    if (res.status != 200) {
        console.error(`An error occured during fetch. ${await res.text()}`)
        return []
    }
    else {
        const json = await res.json();
        const array: (Server & ProxyServer)[] = json.map((proxy: ProxyServer & {server: Server}) => {
            return {
                id: proxy.id,
                enable: proxy.server.enable,
                name: proxy.server.name,
                hostname: proxy.server.hostname,
                http_port: proxy.server.http_port,
                ssl_port: proxy.server.ssl_port,
                use_ssl: proxy.server.use_ssl,
                forward_scheme: proxy.forward_scheme,
                forward_server: proxy.forward_server,
                forward_port: proxy.forward_port,
                serverId: proxy.serverId,
                authId: proxy.server.authId,
            }
        })
        return array;
    }
}

export async function GetAllAuthConfigs(fetchFunc = fetch): Promise<(Auth & {locations: Location[]})[]> {
    const res = await fetchFunc('/api/v1/auth/Get-Auth?includeLocations=true')
    if (res.status != 200) {
        console.error(`An error occured during fetch. ${await res.text()}`);
        return []
    }
    else {
        const json = await res.json();
        return json as (Auth & {locations: Location[]})[];
    }
}