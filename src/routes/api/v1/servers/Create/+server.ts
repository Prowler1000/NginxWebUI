import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { Server } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

type RequestParameters = Omit<Server, 'id'>

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const params: RequestParameters = await helper.GetJson();
    if (helper.OK) {
        try {
            if ('id' in params) {
                delete params.id
                params['id'] = undefined;
            }
            const result = await prisma.server.create({
                data: params
            });
            helper.ResponseJSON = result;
        }
        catch (e) {
            console.error(e);
            helper.SetInternalError(`An error occured while accessing the database. \n\n ${e}`);
        }

    }
    return helper.Response;
}