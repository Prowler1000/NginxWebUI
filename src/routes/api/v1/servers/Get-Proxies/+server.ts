import prisma from "$lib/server/db";
import { ParseEnum, ParseInt, ParseNumArrayQuery, ParseSearchParams } from "$lib/server/parser";
import { ContentType, ResponseHelper, Status } from "$lib/server/responseHelper";
import { Scheme } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

/*  Parameters:
    id?:                Int | Int[]
    serverId?:          Int | Int[]
    scheme?:            "HTTP" | "HTTPS"
    forward-server?:    String
    forward-port?:      Int | Int[]

*/

export const GET: RequestHandler = async ({ url }): Promise<Response> => {
    const params = ParseSearchParams(url.search);
    const ids = ParseNumArrayQuery(params["id"]);
    const serverIds = ParseNumArrayQuery(params["serverId"]);
    const scheme = ParseEnum(Scheme, params["scheme"]);
    const fwd_server = params["forward-server"];
    const fwd_port = ParseInt(params["forward-port"]);

    try {
        const results = await prisma.proxyServer.findMany({
            where: {
                id: ids,
                serverId: serverIds,
                forward_scheme: scheme,
                forward_server: fwd_server,
                forward_port: fwd_port,
            }
        })
        return new ResponseHelper()
            .Body(JSON.stringify(results))
            .ContentType(ContentType.JSON)
            .Status(Status.OK)
            .Response;
    }
    catch (e) {
        return new ResponseHelper()
            .Body(`An error occured while fetching results. ${e}`)
            .Status(Status.INTERNAL_SERVER_ERROR)
            .Response
    }
}