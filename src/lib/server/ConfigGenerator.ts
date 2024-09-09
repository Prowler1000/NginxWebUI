import type { ProxyServer, Server, SSLConfig, Stream } from "@prisma/client";
import prisma from "./db";

type proxyType = ProxyServer & {server: Server & {ssl_config: SSLConfig | null}};

const default_ssl_config: SSLConfig  ={
    id: 0,
    name: "default",
    cert_location: "/ssl/default/fullkey.pem",
    cert_key_location: "/ssl/default/privkey.pem",
    session_timeout: "1d",
    session_cache: "shared:MozSSL:10m",
    session_tickets: false,
    protocols: ["TLSv1.3"],
    prefer_server_ciphers: false,
    stapling: false,
    stapling_verify: false,
}

const default_server: proxyType = {
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
        sSLConfigId: null,
        ssl_config: default_ssl_config,
    }
}

const WHITESPACE_STRING = "\t"

interface Block {
    title?: string,
    contents: (string | Block)[]
}

function ParseDirective(directive: string) {
    const directive_content = directive.trim().replace('\n', '');
    const semi_colon = directive_content.endsWith(';') 
        || directive_content.length === 0 
        || directive_content.startsWith('#') 
        ? '' : ';';
    const new_line = directive.endsWith('\n') ? '\n' : '';
    return `${directive_content}${semi_colon}${new_line}`;
}

function ParseBlock(block: Block, whitespace=0) {
    const top_level_ws = Array.from({length: whitespace}, () => WHITESPACE_STRING).join("");
    const second_level_ws = block.title !== undefined ? top_level_ws + WHITESPACE_STRING : top_level_ws;
    let parsedBlock = '';
    if (block.title !== undefined) {
        parsedBlock += `${top_level_ws}${block.title} {\n`;
    }
    for (const content of block.contents) {
        if (typeof content === "string") {
            const directive = ParseDirective(content);
            parsedBlock += `${second_level_ws}${directive}${directive.endsWith('\n') ? '' : '\n'}`;
        }
        else {
            parsedBlock += ParseBlock(content, whitespace+1);
        }
    }
    if (block.title !== undefined) {
        parsedBlock += `${top_level_ws}}\n\n`;
    }
    return parsedBlock;
}

export async function GenerateSiteConfigs() {
    const sites = await prisma.proxyServer.findMany({
        include: {
            server: {
                include: {
                    ssl_config: true,
                }
            }
        }
    });
    sites.push(default_server); // Ensure the default server is always generated
    const data: { [key: string]: string } = {};
    for (const site of sites) {
        if (site.server.enable)
            data[site.server.name.trim().replace(" ", "_")] = await GenerateSiteConfig(site)
    }
    return data;
}

export async function GenerateSSLConfigs() {
    const configs = await prisma.sSLConfig.findMany();
    configs.push(default_ssl_config);
    const data: { [key: string]: string} = {};
    for (const conf of configs) {
        data[conf.name.trim().replace(" ", "_")] = await GenerateSSLConfig(conf);
    }
    return data;
}

async function GenerateSSLConfig(config: SSLConfig) {
    return ParseBlock({
        contents: [
            `ssl_certificate ${config.cert_location}`,
            `ssl_certificate_key ${config.cert_key_location}`,
            `ssl_session_timeout ${config.session_timeout}`,
            `ssl_session_cache ${config.session_cache}`,
            `ssl_session_tickets ${config.session_tickets ? 'on' : 'off'}`,
            `\n`,
            `ssl_protocols ${config.protocols.join(" ")}`,
            `ssl_prefer_server_ciphers ${config.prefer_server_ciphers ? 'on' : 'off'}`,
            `\n`,
            `ssl_stapling ${config.stapling ? 'on' : 'off'}`,
            `ssl_stapling_verify ${config.stapling_verify ? 'on' : 'off'}`,
        ]
    });
}

async function GetSSLConfLocation(config: SSLConfig | null) {
    return `/config/nginx/ssl/${(config ?? default_ssl_config).name.trim().replace(" ", "_")}.conf`;
}

async function GenerateSiteConfig(data: proxyType) {
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
            `include ${await GetSSLConfLocation(data.server.ssl_config)}`,
            '\n',
            `set $forward_scheme ${data.forward_scheme.toLowerCase()}`,
            `set $server "${data.forward_server}"`,
            `set $port ${data.forward_port}`,
            '\n',
            `error_log /log/${data.server.name.replace(" ", "_")}_error.log`,
            '\n',
            {
                title: "location /",
                contents: [
                    `proxy_pass $forward_scheme://$server:$port\n`,
                    ... auth !== null ? [
                        `auth_request ${auth.auth_request}`,
                        'add_header Set-Cookie $auth_cookie',
                        '\n',
                        '# Generic Directives',
                        ...auth.directives.map(directive => ParseDirective(directive)),
                        '\n',
                        '# Auth request headers',
                        ...auth.auth_request_headers.map(header => `auth_request_set ${header}`),
                        '\n',
                        '# Proxy Headers',
                        ...auth.proxy_headers.map(header => `proxy_set_header ${header}`),
                        '\n'
                    ]: [],
                    ... (await GenerateGeneralHeaders()),
                    '\n',
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

export async function GenerateStreamConfigs(): Promise<string> {
    const streams = await prisma.stream.findMany();
    const map = streams.flatMap(async stream => [
        `# ${stream.name}`,
        await GenerateStreamConfig(stream),
        '\n',
    ]);
    const stream_map = (await Promise.all(map)).flat();
    return ParseBlock({
        title: "stream",
        contents: [
            ...stream_map
        ]
    })
}

async function GenerateStreamConfig(stream: Stream): Promise<Block> {
    return {
        title: "server",
        contents: [
            `listen ${stream.incomming_port}`,
            "proxy_connect_timeout 60s",
            "proxy_socket_keepalive on",
            `proxy_pass ${stream.upstream_host}:${stream.upstream_port}`,
        ]
    };
}

async function GenerateGeneralHeaders() {
    return [
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
        '\n',
        `proxy_buffers 8 16k;`,
        `proxy_buffer_size 32k;`,
        '\n',
        `proxy_ssl_server_name on;`,
        `proxy_ssl_name $host;`,
        `proxy_ssl_session_reuse off;`,
        '\n',
        `proxy_ssl_protocols TLSv1.2 TLSv1.3;`,
        '\n',
        `proxy_set_header Host $http_host;`,
        `proxy_set_header Upgrade $http_upgrade;`,
        `proxy_set_header Connection $connection_upgrade;`,
        `proxy_set_header X-Real-IP $remote_addr;`,
        `proxy_set_header Forwarded $proxy_add_forwarded;`,
        `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
        `proxy_set_header X-Forwarded-Proto $scheme;`,
        `proxy_set_header X-Forwarded-Host $host;`,
        `proxy_set_header X-Forwarded-Port $server_port;`,
        '\n',
        `proxy_connect_timeout 60s;`,
        `proxy_send_timeout 60s;`,
        `proxy_read_timeout 60s;`,
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
            "tcp_nodelay on;",
            "server_tokens off",
            "log_not_found off",
            "types_hash_max_size 2048",
            "types_hash_bucket_size 64",
            "client_max_body_size 0M",
            "\n",
            "include /etc/nginx/mime.types;",
            "default_type application/octet-stream;",
            "\n",
            "include /config/nginx/resolvers.conf;",
            "\n",
            {
                title: "map $http_upgrade $connection_upgrade",
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
            "include /config/sites/*.conf",
        ]
    }
    return "worker_processes auto;\n" + 
        "worker_rlimit_nofile 300000;\n\n" +
        "include /etc/nginx/modules-enabled/*.conf;\n\n" +
        "pcre_jit on;\n\n" +
        "error_log /log/error.log warn;\n\n" +
        ParseBlock(events, 0) +
        ParseBlock(http, 0) +
        "include /config/nginx/stream.conf;";
}