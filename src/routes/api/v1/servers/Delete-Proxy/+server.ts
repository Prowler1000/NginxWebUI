import prisma from "$lib/server/db";
import { ContentType, RequestHelper, type RequestHelperParams } from "$lib/server/RESTHelpers";
import type { RequestHandler } from "@sveltejs/kit";

const HelperParams: RequestHelperParams = {
    expectedContentType: ContentType.JSON,
}

interface Parameters {
    id?: number
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(HelperParams, request);
    const json: Parameters = await helper.GetJson();
    if (helper.OK) {
        const id = json["id"];
        if (id === undefined) {
            helper.SetClientError("'id' not defined. Cannot delete proxy server without an id.")
        }
        else {
            try {
                const deleted = await prisma.proxyServer.delete({
                    where: {
                        id: id,
                    }
                });
                helper.ResponseText = `Successfully deleted proxy server with ID: ${deleted.id}`;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
                console.error(e);
            }
        }
    }
    return helper.Response;
}