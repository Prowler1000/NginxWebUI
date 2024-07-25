import type { RequestHandler } from "./$types";
import prisma from "$lib/server/db";
import { ParseBoolean, ParseInt, ParseNumArrayQuery, ParseSearchParams } from "$lib/server/parser";
import { stringQueryGen } from "$lib/server/queryHelper";
import { ContentType, ResponseHelper } from "$lib/server/responseHelper";

export const GET: RequestHandler = async({ url }) => {
    const params = ParseSearchParams(url.search);
    const id = ParseNumArrayQuery(params["id"]);
    const name = stringQueryGen(
        params["name"],
        ParseBoolean(params["match-exact-name"] ?? true),
        ParseBoolean(params["match-case-name"] ?? true),
    );
    const value = stringQueryGen(
        params["value"],
        ParseBoolean(params["match-exact-value"] ?? true),
        ParseBoolean(params["match-case-value"] ?? true),
    );
    const max = ParseInt(params["max"]); // Currently does nothing
    try {
        const results = await prisma.header.findMany({
            where: {
                id: id,
                name: name,
                value: value
            }
        });
        return new ResponseHelper()
        .Body(JSON.stringify(results))
        .ContentType(ContentType.JSON)
        .Status(200)
        .Response;

    }
    catch (e) {
        return new ResponseHelper()
        .Body(`An error occured while processing the database request. ${e}`)
        .Status(500)
        .Response;
    }
}