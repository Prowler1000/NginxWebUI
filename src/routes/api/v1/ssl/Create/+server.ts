import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { SSLConfig } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson();
    if (helper.OK) {
        try {
            const result = await prisma.sSLConfig.create({
                data: json as SSLConfig,
            });
            helper.ResponseJSON = result;
        }
        catch (e) {
            helper.SetInternalError(`An error occured while accessing the database. ${e}`);
            console.error(e);
        }
    }
    return helper.Response;
}