import { ParseBoolean, ParseInt } from "$lib/server/parser";
import assert from "assert";
import type { RequestHandler } from "@sveltejs/kit";
import { ResponseHelper, Status } from "$lib/server/RESTHelpers";
import prisma from "$lib/server/db";

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
        return new Response(`Invalid request type. Expected application/json, got ${request.headers.get("Content-Type")}`,
            new ResponseHelper()
            .Status(Status.BAD_REQUEST)
            .toInit()
        )
    }
    let data: Record<string, Record<string, string>>;
    try {
        data = await request.json();
    }
    catch {
        return new Response("Error parsing request json.", 
            new ResponseHelper()
            .Status(Status.BAD_REQUEST)
            .toInit()
        )
    }
    if (Object.values(data).some(x => !("hostname" in x && x["hostname"].length > 0))) {
        return new Response(`One or more servers are missing a hostname.`,
            new ResponseHelper()
            .Status(Status.BAD_REQUEST)
            .toInit()
        )
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
        return new Response(`Create ${result.count} servers.`,
            new ResponseHelper()
            .Status(Status.OK)
            .toInit()
        )
    }
    catch (e) {
        return new Response(`An error occured while creating servers. ${e}`,
            new ResponseHelper()
            .Status(Status.INTERNAL_SERVER_ERROR)
            .toInit()
        )
    }
}