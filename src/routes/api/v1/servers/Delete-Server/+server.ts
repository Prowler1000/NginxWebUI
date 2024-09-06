import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { RequestHandler } from "@sveltejs/kit";

interface Parameters {
    id?: number
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json: Parameters = await helper.GetJson();
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