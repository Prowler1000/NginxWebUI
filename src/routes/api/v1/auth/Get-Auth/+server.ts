import prisma from "$lib/server/db";
import { ParseBoolean, ParseEnum, ParseInt, ParseNumArrayQuery, ParseSearchParams } from "$lib/server/parser";
import { ContentType, RequestHelper, ResponseHelper, Status, type RequestHelperParams } from "$lib/server/RESTHelpers";
import { Scheme } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

/*  Parameters:             Type:           Default:
    id?:                    Int | Int[]     Undefined
    auth-request?:          String          Undefined
    auth-request-exact?:    Boolean         True
    includeLocations?:      Boolean         False
*/

export const GET: RequestHandler = async ({ url }): Promise<Response> => {
    const params = ParseSearchParams(url.search);
    const ids = ParseNumArrayQuery(params["id"]);
    const auth_request = params["auth-request"];
    const auth_request_exact = ParseBoolean(params["auth-request-exact"] ?? true); // Currently does nothing, whoops
    const include_locations = ParseBoolean(params["includeLocations"] ?? false);

    try {
        const results = await prisma.auth.findMany({
            where: {
                id: ids,
                auth_request: auth_request,
            },
            include: {
                locations: include_locations,
            },
        });
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