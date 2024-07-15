import type { RequestHandler } from "./$types";
import { ParseSearchParams, ParseBoolean, ParseNumArrayQuery } from "$lib/server/parser";
import prisma from "$lib/server/db";
import { ContentType, ResponseHelper, Status } from "$lib/server/responseHelper";
import { stringQueryGen } from "$lib/server/queryHelper";

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
    include-headers?:       Boolean         (Include server headers in the result. Default true)
*/


export const GET: RequestHandler = async ({ url }) => {
    const params = ParseSearchParams(url.search);
    const ids = ParseNumArrayQuery(params["id"]);
    const name = stringQueryGen(
        params["name"],
        ParseBoolean(params["exact-name"] ?? true),
        ParseBoolean(params["match-case-name"] ?? false)
    )
    const hostname = stringQueryGen(
        params["hostname"],
        ParseBoolean(params["exact-hostname"] ?? true),
        ParseBoolean(params["match-case-hostname"] ?? false)
    )
    const http_ports = ParseNumArrayQuery(params["http-port"]);
    const ssl_ports = ParseNumArrayQuery(params["ssl-port"]);
    const use_ssl = ParseBoolean(params["use-ssl"]);

    const inc_headers = ParseBoolean(params["include-headers"] ?? true);
    try {
        const results = await prisma.server.findMany({
            where: {
                id: ids,
                name: name,
                hostname: hostname,
                http_port: http_ports,
                ssl_port: ssl_ports,
                use_ssl: use_ssl
            },
            include: {
                ServerHeader: inc_headers && {
                    select: {
                        header: true
                    }
                }
            }
        })
        return new Response(JSON.stringify(results), 
            new ResponseHelper()
            .ContentType(ContentType.JSON)
            .Status(Status.OK)
            .toInit()
        );
    }
    catch (e) {
        return new Response(`An error occured while fetching results. ${e}`, 
            new ResponseHelper()
            .Status(500)
            .toInit()
        );
    }
}