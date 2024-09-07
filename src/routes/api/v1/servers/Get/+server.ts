import prisma from "$lib/server/db";
import { SearchParamsHelper } from "$lib/server/GetHelper";
import { ParseBoolean, ParseNum } from "$lib/server/parser";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const params = new SearchParamsHelper(url.searchParams);
    const helper = new RequestHelper();
    try {
        const res = await prisma.server.findMany({
            where: {
                id: ParseNum(params.grab("id")),
                enable: ParseBoolean(params.grab("enable")),
                name: params.grab("name"),
                hostname: params.grab("hostname"),
                http_port: ParseNum(params.grab("http_port")),
                ssl_port: ParseNum(params.grab("ssl_port")),
                use_ssl: ParseBoolean(params.grab("use_ssl")),
            },
            include: {
                auth: ParseBoolean(params.grab("include_auth")),
                ssl_config: ParseBoolean(params.grab("include_sslconfig")),
            }
        });
        helper.ResponseJSON = res;
    }
    catch (e) {
        helper.SetInternalError(`An error occured while accessing the database. \n\n${e}`)
    }
    return helper.Response;
}