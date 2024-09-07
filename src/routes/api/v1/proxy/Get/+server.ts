import prisma from "$lib/server/db";
import { SearchParamsHelper } from "$lib/server/GetHelper";
import { ParseBoolean, ParseEnum, ParseNum } from "$lib/server/parser";
import { RequestHelper } from "$lib/server/RESTHelpers";
import { Scheme } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const params = new SearchParamsHelper(url.searchParams);
    const helper = new RequestHelper();
    try {
        const res = await prisma.proxyServer.findMany({
            where: {
                id: ParseNum(params.grab("id")),
                forward_scheme: ParseEnum(Scheme, params.grab("forward_scheme")),
                forward_server: params.grab("forward_server"),
                forward_port: ParseNum(params.grab("forward_port")),
            },
            include: {
                server: ParseBoolean(params.grab("include_server")),
            }
        });
        helper.ResponseJSON = res;
    }
    catch (e) {
        helper.SetInternalError(`An error occured while accessing the database. \n\n${e}`)
    }
    return helper.Response;
}