import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers"
import type { RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json: {id: number} = await helper.GetJson();
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError('ID of resource to delete not specified.')
        }
        else {
            try {
                const res = await prisma.proxyServer.delete({
                    where: {
                        id: Number(json.id)
                    }
                });
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database.\n\n${e}`)
            }
        }
    }
    return helper.Response;
}