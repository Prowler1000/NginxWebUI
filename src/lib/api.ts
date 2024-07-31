import { type Server, type Header } from "@prisma/client"

export interface ServerWithHeaders extends Server {
    headers: Header[]
}

export async function GetAllServers(fetchFunc = fetch): Promise<ServerWithHeaders[]> {
    const res = await fetchFunc("api/v1/servers/Get-Servers");
    const json = await res.json();
    const serverArray: ServerWithHeaders[] = json.map((server: Server & {ServerHeader: {header: Header}[]}) => {
        return {
            id: server.id,
            enable: server.enable,
            name: server.name,
            hostname: server.hostname,
            http_port: server.http_port,
            ssl_port: server.ssl_port,
            use_ssl: server.use_ssl,
            headers: server.ServerHeader.map(header => {
                return header.header
            })
        }
    });
    return serverArray;
}

export async function GetAllHeaders(fetchFunc = fetch): Promise<Header[]> {
    const res = await fetchFunc("api/v1/Get-Headers");
    const json = await res.json();
    return json;
}