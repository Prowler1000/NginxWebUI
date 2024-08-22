import prisma from "$lib/server/db";
import { ContentType, RequestHelper, type RequestHelperParams } from "$lib/server/RESTHelpers";
import type { RequestHandler } from "@sveltejs/kit";

const HelperParams: RequestHelperParams = {
    expectedContentType: ContentType.JSON,
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(HelperParams, request);
    const json = await helper.GetJson();
    if (helper.OK) {
        const id = json["id"];
        if (id === undefined) {
            helper.SetClientError("'id' not defined. Cannot delete server without an id.")
        }
        else {
            try {
                const deleted = await prisma.server.delete({
                    where: {
                        id: id,
                    }
                });
                helper.ResponseText = `Successfully deleted server with ID: ${deleted.id}`;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
                console.error(e);
            }
        }
    }
    return helper.Response;
}