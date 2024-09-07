import { type Auth, type ProxyServer, type Server, type SSLConfig } from "@prisma/client"

export async function GetAllServers(fetchFunc = fetch): Promise<Server[]> {
    const res = await fetchFunc("api/v1/servers/Get");
    const json = await res.json();
    return json as Server[];
}

export async function CreateServer(server: Server, fetchFunc = fetch): Promise<Server | null> {
    try {
        const res = await fetchFunc("/api/v1/servers/Create", {
            method: 'POST',
            body: JSON.stringify(server),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.status === 200) {
            return await res.json() as Server
        }
    }
    catch (e) {
        console.error(e)
    }
    return null;
}

export async function UpdateServer(server: Server, fetchFunc = fetch): Promise<Server | null> {
    try {
        const res = await fetchFunc("/api/v1/servers/Update", {
            method: 'PATCH',
            body: JSON.stringify(server),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.status === 200) {
            return await res.json() as Server
        }
    }
    catch (e) {
        console.error(e)
    }
    return null;
}

export async function DeleteServer(id: number, fetchFunc = fetch): Promise<boolean> {
    return (await fetchFunc("/api/v1/servers/Delete", {
        method: 'DELETE',
        body: JSON.stringify({
            id: id,
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    })).status === 200;
}

export async function GetAllProxyServers(fetchFunc = fetch): Promise<(Server & ProxyServer)[]> {
    const res = await fetchFunc('/api/v1/proxy/Get?include_server=true');
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
                sSLConfigId: proxy.server.sSLConfigId,
            }
        })
        return array;
    }
}

export async function CreateProxyServer(server: ProxyServer, fetchFunc = fetch): Promise<ProxyServer | null> {
    try {
        const res = await fetchFunc("/api/v1/proxy/Create", {
            method: 'POST',
            body: JSON.stringify(server),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.status === 200) {
            return await res.json() as ProxyServer
        }
    }
    catch (e) {
        console.error(e)
    }
    return null;
}

export async function UpdateProxyServer(server: ProxyServer, fetchFunc = fetch): Promise<ProxyServer | null> {
    try {
        const res = await fetchFunc("/api/v1/servers/Update", {
            method: 'PATCH',
            body: JSON.stringify(server),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.status === 200) {
            return await res.json() as ProxyServer
        }
    }
    catch (e) {
        console.error(e)
    }
    return null;
}

export async function DeleteProxyServer(id: number, fetchFunc = fetch): Promise<boolean> {
    return (await fetchFunc("/api/v1/proxy/Delete", {
        method: 'DELETE',
        body: JSON.stringify({
            id: id,
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    })).status === 200;
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

export async function GetAllSSLConfigs(fetchFunc = fetch): Promise<SSLConfig[]> {
    const res = await fetchFunc('/api/v1/ssl/Get-SSL-Configs');
    if (res.status != 200) {
        console.error(`An error occured during fetch. ${await res.text()}`)
        return []
    }
    else {
        const json = await res.json();
        return json as SSLConfig[]
    }
}

export async function CreateSSLConfig(config: SSLConfig, fetchFunc = fetch): Promise<SSLConfig | null> {
    try {
        const obj = JSON.parse(JSON.stringify(config))
        delete obj["id"];
        const res = (await fetchFunc("/api/v1/ssl/Create", {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json',
            }
        }));
        if (res.status === 200) {
            return res.json();
        }
        else {
            return null;
        }
    }
    catch {
        return null;
    }
}

export async function UpdateSSLConfig(config: SSLConfig, fetchFunc = fetch): Promise<SSLConfig | null> {
    try {
        const res = await fetchFunc("/api/v1/ssl/Create-Update", {
            method: 'POST',
            body: JSON.stringify(config),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (res.status === 200) {
            return res.json();
        }
        else {
            return null;
        }
    }
    catch {
        return null;
    }
}

export async function DeleteSSLConfig(id: number, fetchFunc = fetch) {
    await fetchFunc("/api/v1/ssl/Delete", {
        method: 'DELETE',
        body: JSON.stringify({
            id: id,
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
}