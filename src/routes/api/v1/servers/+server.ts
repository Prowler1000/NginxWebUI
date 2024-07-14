import type { RequestHandler } from "./$types";
import { ParseSearchParams, ParseBoolean, ParseInt } from "$lib/server/parser";
import prisma from "$lib/server/db";
import assert from "assert";

const jsonResponseHeader: Headers = new Headers({
    "Content-Type": "application/json",
});

const parseParamNumArray = (param: string | undefined): number[] | undefined => {
    const array = param ? [] as number[] : undefined
    if (array && param) {
        for (const value of param.split(",")) {
            array.push(Number(value));
        }
    }
    return array;
}

// ?? Bad name
const prismaQueryGen = <T>(parameter: T, exact: boolean, match_case: boolean): { 
    equals: T | undefined, 
    contains: T | undefined, 
    mode: "default" | "insensitive"
} => {
    return {
        equals: exact ? parameter : undefined,
        contains: exact ? undefined : parameter,
        mode: match_case ? "default" : "insensitive",
    }
} 

/*  Parameters
    id?:                    Int | Int[]
    name?:                  String          
    exact-name?:            Boolean         (Match exact [true] or partial [false]. Default true)
    match-case-name?:       Boolean         (Whether to match case sensitive. Default false)
    hostname?:              String
    exact-hostname?:        Boolean         (Match exact [true] or partial [false]. Default true)
    match-case-hostname?:   Boolean         (Whether to match case sensitive. Default false)
    http-port?:             Int | Int[]
    ssl-port?:              Int | Int[]
    use-ssl?:               Boolean         (Match for servers that use SSL)
    include-headers?:       Boolean         (Include server headers in the result)
*/
export const GET: RequestHandler = async ({ url }) => {
    const params = ParseSearchParams(url.search);

    const ids = parseParamNumArray(params["id"]);
    const name = prismaQueryGen<string | undefined>(
        params["name"], 
        ParseBoolean(params["exact-name"] ?? true),
        ParseBoolean(params["match-case-name"] ?? false)
    );
    const hostname = prismaQueryGen<string | undefined>(
        params["hostname"], 
        ParseBoolean(params["exact-hostname"] ?? true),
        ParseBoolean(params["match-case-hostname"] ?? false)
    );
    const http_ports = parseParamNumArray(params["http-port"]);
    const ssl_ports = parseParamNumArray(params["ssl-port"]);
    const use_ssl = params["use-ssl"] === undefined ? undefined : ParseBoolean(params["use-ssl"]);
    const include_headers = ParseBoolean(params["include-headers"] ?? true);

    const results = await prisma.server.findMany({
        where: {
            id: {
                in: ids,
            },
            name: name,
            hostname: hostname,
            http_port: {
                in: http_ports
            },
            ssl_port: {
                in: ssl_ports
            },
            use_ssl: use_ssl
        },
        include: include_headers ? {
            ServerHeader: {
                select: {
                    header: true
                }
            }
        } : undefined
    })
    return new Response(JSON.stringify(results), {
        headers: jsonResponseHeader
    });
}

interface ServerObject {
    enable:     boolean,
    name:       string,
    hostname:   string,
    http_port:  number,
    ssl_port:   number,
    use_ssl:    boolean
}

function createServerObj(name: string, params: Record<string, string>): ServerObject {
    assert("hostname" in params);
    assert(params["hostname"].length > 0);
    return {
        enable:     ParseBoolean(params["enable"] ?? true),
        name:       name,
        hostname:   params["hostname"],
        http_port:  ParseInt(params["http-port"] ?? 80),
        ssl_port:   ParseInt(params["ssl-port"] ?? 443),
        use_ssl:    ParseBoolean(params["use-ssl"] ?? true),
    }
}

export const POST: RequestHandler = async ({ request }) => {
    if (request.headers.get("Content-Type") !== "application/json") {
        return new Response(`Invalid request type. Expected application/json, got ${request.headers.get("Content-Type")}`, {
            status: 400
        });
    }
    let data: Record<string, Record<string, string>>;
    try {
        data = await request.json();
    }
    catch {
        return new Response("Error parsing request json.", {
            status: 400
        })
    }
    if (Object.values(data).some(x => !("hostname" in x && x["hostname"].length > 0))) {
        return new Response(`One or more server objects are missing a hostname.`, { status: 400 });
    }
    const servers: Array<ServerObject> = [];
    for (const key in data) {
        servers.push(createServerObj(key, data[key]));
    }
    try {     
        const result = await prisma.server.createMany({
            data: servers,
            skipDuplicates: true,
        });
        return new Response(`Created ${result.count} servers.`, { status: 200 });
    }
    catch (e) {
        return new Response(`An error occured while creating servers. ${e}`, { status: 500 })
    }
}
