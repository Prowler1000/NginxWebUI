import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { RequestHandler } from "@sveltejs/kit";

export const DELETE: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson();
    if (helper.OK) {
        if ('id' in json) {
            try {
                const res = await prisma.sSLConfig.delete({
                    where: {
                        id: json.id as number
                    }
                });
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
            }
        }
        else {
            helper.SetClientError("No ID specified.");
        }
    }
    return helper.Response;
}