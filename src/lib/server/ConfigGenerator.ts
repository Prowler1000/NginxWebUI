import type { ProxyServer, Server } from "@prisma/client";
import prisma from "./db";

const default_server: ProxyServer & {server: Server} = {
    id: 0,
    forward_scheme: "HTTP",
    forward_server: "127.0.0.1",
    forward_port: 8080,
    serverId: 0,
    server: {
        id: 0,
        enable: true,
        name: "default",
        hostname: "_",
        http_port: 80,
        ssl_port: 443,
        use_ssl: true,
        authId: null,
    }
}

const WHITESPACE_STRING = "\t"

interface Block {
    title: string,
    contents: (string | Block)[]
}

function ParseBlock(block: Block, whitespace=0) {
    const top_level_ws = Array.from({length: whitespace}, () => WHITESPACE_STRING).join("");
    const second_level_ws = top_level_ws + WHITESPACE_STRING;
    let parsedBlock = `${top_level_ws}${block.title} {\n`;
    for (const content of block.contents) {
        if (typeof content === "string") {

            parsedBlock += `${second_level_ws}${content}${content.trim().endsWith(';') ? '' : ';'}\n`;
        }
        else {
            parsedBlock += ParseBlock(content, whitespace+1);
        }
    }
    parsedBlock += `${top_level_ws}}\n\n`;
    return parsedBlock;
}

export async function GenerateSiteConfigs() {
    const sites = await prisma.proxyServer.findMany({
        select: {
            id: true,
            forward_scheme: true,
            forward_server: true,
            forward_port: true,
            server: true,
            serverId: true,
        }
    });
    sites.push(default_server); // Ensure the default server is always generated
    const data: { [key: string]: string } = {};
    for (const site of sites) {
        data[site.server.name.trim().replace(" ", "_")] = await GenerateSiteConfig(site)
    }
    return data;
}

async function GenerateSiteConfig(site: number | ProxyServer | ProxyServer & {server: Server}) {
    let data: ProxyServer & {server: Server};
    if (typeof site === "number") {
        data = await prisma.proxyServer.findFirst({
            where: {
                id: site
            },
            select: {
                server: true,
            },
        })
    }
    // Check if a Server field exists in 'site'
    else if (!("server" in site)) {
        data = await prisma.proxyServer.findFirst({
            where: {
                id: site.id,
            },
            select: {
                server: true,
            },
        })
    }
    else {
        data = site as ProxyServer & {server: Server};
    }
    const auth = data.server.authId !== null ? await prisma.auth.findFirst({
        where: {
            id: data.server.authId,
        },
        include: {
            locations: true,
        }
    }) : null;
    const default_server = data.server.hostname == "_" && data.server.name == "default" ? ' default_server' : ''
    return ParseBlock({
        title: "server",
        contents: [
            // If we want to use SSL, append a list of directives, otherwise append an empty list (nothing)
            ... data.server.use_ssl ? [
                `listen ${data.server.ssl_port} quic${default_server}`,
                `listen ${data.server.ssl_port} ssl${default_server}`
            ] : [],
            `server_name ${data.server.hostname}`,
            `include /config/nginx/ssl-default.conf`,
            `set $forward_scheme ${data.forward_scheme.toLowerCase()}`,
            `set $server "${data.forward_server}"`,
            `set $port ${data.forward_port}`,
            `error_log /log/${data.server.name.replace(" ", "_")}_error.log`,
            '\n',
            {
                title: "location /",
                contents: [
                    `proxy_pass $forward_scheme://$server:$port`,
                    ... auth !== null ? [
                        `auth_request ${auth.auth_request}`,
                        'add_header Set-Cookie $auth_cookie',
                        ...auth.auth_request_headers.map(header => `auth_request_set ${header}`),
                        ...auth.proxy_headers.map(header => `proxy_set_header ${header}`)
                    ]: [],
                    ... (await GenerateGeneralHeaders()),
                    ... (await GenerateProxyDeclarations())
                ]
            },
            ... auth !== null ? auth.locations.map((loc) => {
                return {
                    title: `location ${loc.prefix}${loc.location}`,
                    contents: loc.directives,
                } as Block
            }) : []
        ]
    });
}

async function GenerateGeneralHeaders() {
    return [
        `add_header Strict-Transport-Security "max-age=63072000" always;`,
        `add_header Strict-Transport-Security "max-age=63072000" always;`,
        `add_header X-XSS-Protection "1; mode=block" always;`,
        `#add_header X-Content-Type-Options "nosniff" always;`,
        `add_header Referrer-Policy "no-referrer-when-downgrade" always;`,
        `add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;`,
        `add_header Permissions-Policy "interest-cohort=()" always;`,
        `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`,
    ]
}
async function GenerateProxyDeclarations() {
    return [
        `proxy_http_version 1.1;`,
        `proxy_cache_bypass $http_upgrade;`,

        `proxy_buffers 8 16k;`,
        `proxy_buffer_size 32k;`,

        `proxy_ssl_server_name on;`,
        `proxy_ssl_name $host;`,
        `proxy_ssl_session_reuse off;`,

        `proxy_ssl_protocols TLSv1.2 TLSv1.3;`,

        `proxy_set_header Host $http_host;`,
        `proxy_set_header Upgrade $http_upgrade;`,
        `proxy_set_header Connection $connection_upgrade;`,
        `proxy_set_header X-Real-IP $remote_addr;`,
        `proxy_set_header Forwarded $proxy_add_forwarded;`,
        `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
        `proxy_set_header X-Forwarded-Proto $scheme;`,
        `proxy_set_header X-Forwarded-Host $host;`,
        `proxy_set_header X-Forwarded-Port $server_port;`,

        `proxy_connect_timeout 60;`,
        `proxy_send_timeout 60;`,
        `proxy_read_timeout 60;`,
    ]
}

export async function GenerateNginxConfig() {
    // No DB calls for this function for now
    const events: Block = {
        title: "events",
        contents: [
            "multi_accept on",
            "worker_connections 65535"
        ]
    };
    const http: Block = {
        title: "http",
        contents: [
            "http2 on",
            "http3 on",
            "charset utf-8",
            "sendfile on",
            "tcp_nopush on;",
            "server_tokens off",
            "log_not_found off",
            "types_hash_max_size 2048",
            "types_hash_bucket_size 64",
            "client_max_body_size 0M",
            "include /etc/nginx/mime.types;",
            "include /config/nginx/resolvers.conf;",
            "default_type application/octet-stream;\n",
            {
                title: "map $http_update $connection_upgrade",
                contents: [
                    `default upgrade;`,
                    `""      close;`
                ]
            },
            {
                title: "map $remote_addr $proxy_forwarded_elem",
                contents: [
                    `# IPv4 addresses can be sent as-is`,
                    `~^[0-9.]+$        "for=$remote_addr";`,

                    `# IPv6 addresses need to be bracketed and quoted`,
                    `~^[0-9A-Fa-f:.]+$ "for=\\"[$remote_addr]\\"";`,

                    `# Unix domain socket names cannot be represented in RFC 7239 syntax`,
                    `default           "for=unknown";`,
                ]
            },
            {
                title: "map $http_forwarded $proxy_add_forwarded",
                contents: [
                    `# If the incoming Forwarded header is syntactically valid, append to it`,
                    `"~^(,[ \\t]*)*([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?(;([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\x80-\\\xFF]|\\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?)*([ \\\t]*,([ \\\t]*([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?(;([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?)*)?)*$" "$http_forwarded, $proxy_forwarded_elem";`,
                    `# Otherwise, replace it`,
                    `default "$proxy_forwarded_elem";`
                ]
            },
            "include /config/sites/*.conf"
        ]
    }
    return "worker_processes auto;\n" + 
        "worker_rlimit_nofile 300000;\n\n" +
        "include /etc/nginx/modules-enabled/*.conf;\n\n" +
        "pcre_jit on;\n\n" +
        "error_log /log/error.log warn;\n\n" +
        ParseBlock(events, 0) +
        ParseBlock(http, 0);
}