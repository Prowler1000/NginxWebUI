import prisma from "$lib/server/db";
import { ContentType, RequestHelper, type RequestHelperParams } from "$lib/server/RESTHelpers";
import type { Server } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

const helperParams: RequestHelperParams = {
    expectedContentType: ContentType.JSON,
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(helperParams, request);
    const json = await helper.GetJson();
    if (helper.OK) {
        if (!("id" in json)) {
            helper.SetClientError("id not supplied.");
        }
        else {
            const server = json as Server;
            const id = (json["id"] ?? server["id"]) as number;
            const result = await prisma.server.upsert({
                where: {
                    id: id
                },
                update: server,
                create: server,
            });
            helper.ResponseJSON = result;
        }
        
    }

    return helper.Response;
}