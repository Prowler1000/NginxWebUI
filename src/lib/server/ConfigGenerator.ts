import type { ProxyServer, Server, Location } from "@prisma/client";
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

async function GenerateLocation(location: number | Location) {
    let data: Location
    if (typeof location === "number") {
        data = await prisma.location.findFirst({
            where: {
                id: location
            }
        });
    }
    else {
        data = location
    }

    const conf = `
        location ${data.prefix}${data.location} {
${data.directives.map(directive => `            ${directive}${directive.endsWith(";") ? "" : ";"}`)}
        }
    `
    return justify(conf, 4, 2);
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
    const auth = data.server.authId ? await prisma.auth.findFirst({
        where: {
            id: data.server.authId,
        },
        include: {
            locations: true,
        }
    }) : null;
    const conf = `
        server {
            ${data.server.use_ssl ? `listen ${data.server.ssl_port} quic;` : ''}
            ${data.server.use_ssl ? `listen ${data.server.ssl_port} ssl;` : ''}
            server_name ${data.server.hostname}

            include /etc/nginx/ssl.conf; # Should probably make this configurable

            set $forward_scheme ${data.forward_scheme.toLowerCase()};
            set $server "${data.forward_server}";
            set $port ${data.forward_port};

            error_log /log/${data.server.name}_error.log;

            location / {
                proxy_pass $forward_scheme://$server$:port;

                ${auth != null ? `auth_request ${auth.auth_request};` : ''}
                ${auth != null ? 'add_header Set-Cookie $auth_cookie;': ''}
                
${auth?.auth_request_headers.map(header => `                auth_request_set ${header}${header.endsWith(";") ? '' : ';'}`).join('\n')}

${auth?.proxy_headers.map(header => `                proxy_set_header ${header}${header.endsWith(";") ? '' : ';'}`).join('\n')}

                # General headers
${(await GenerateGeneralHeaders()).map(header => `                ${header}`).join('\n')}

                # Proxy Headers
${(await GenerateProxyDeclarations()).map(dec => `                ${dec}`).join('\n')}
            }
${auth?.locations.map(async (location) => await GenerateLocation(location)).join('\n')}
        }
    `;
    return justify(conf);
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
    const conf = `
        worker_processes auto;
        worker_rlimit_nofile 300000;

        include /etc/nginx/modules-enabled/*.conf;

        pcre_jit on;

        error_log /log/error.log warn;

        events {
            multi_accept on;
            worker_connections 65535;
        }
        
        http {
            http2 on;
            http3 on;
            charset utf-8;
            sendfile on;
            tcp_nopush on;
            tcp_nodelay on;
            server_tokens off;
            log_not_found off;
            types_hash_max_size 2048;
            types_hash_bucket_size 64;
            client_max_body_size 0M;

            include /etc/nginx/mime.types;
            default_type application/octet-stream;

            map $http_update $connection_upgrade {
                default upgrade;
                ""      close;
            }

            map $remote_addr $proxy_forwarded_elem {

                # IPv4 addresses can be sent as-is
                ~^[0-9.]+$        "for=$remote_addr";

                # IPv6 addresses need to be bracketed and quoted
                ~^[0-9A-Fa-f:.]+$ "for=\\"[$remote_addr]\\"";

                # Unix domain socket names cannot be represented in RFC 7239 syntax
                default           "for=unknown";
            }

            map $http_forwarded $proxy_add_forwarded {
                # If the incoming Forwarded header is syntactically valid, append to it
                "~^(,[ \\t]*)*([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?(;([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\x80-\\\xFF]|\\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?)*([ \\\t]*,([ \\\t]*([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?(;([!#$%&'*+.^_\`|~0-9A-Za-z-]+=([!#$%&'*+.^_\`|~0-9A-Za-z-]+|\\"([\\\t \\\x21\\\x23-\\\x5B\\\x5D-\\\x7E\\\x80-\\\xFF]|\\\\[\\\t \\\x21-\\\x7E\\\x80-\\\xFF])*\\"))?)*)?)*$" "$http_forwarded, $proxy_forwarded_elem";

                # Otherwise, replace it
                default "$proxy_forwarded_elem";
            }

            include /config/sites/*.conf;
        }
    `
    return justify(conf);
}

function justify(content: string, ws_per_tab=4, initial_ws=2) {
    let split = content.split("\n");
    if (split.length > 0 && split[0].length == 0) {
        split = split.slice(1);
    }
    let justified_content = "";
    for (const line of split) {
        const whitespace = line.search(/\S|$/);
        const tabs = (whitespace / ws_per_tab) - initial_ws > 0 ? (whitespace / ws_per_tab) - initial_ws : 0;
        const prefix = "\t".repeat(tabs);
        justified_content += prefix + line.trimStart() + "\n";
    }
    return justified_content;
}