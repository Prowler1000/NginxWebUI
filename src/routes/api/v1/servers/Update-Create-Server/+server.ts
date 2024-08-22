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
            const request_server = json as Server;
            const server = {
                enable: request_server.enable,
                name: request_server.name,
                hostname: request_server.hostname,
                http_port: request_server.http_port,
                ssl_port: request_server.ssl_port,
                use_ssl: request_server.use_ssl,
            };
            const id = request_server.id;
            try {
                const result = await prisma.server.upsert({
                    where: {
                        id: id
                    },
                    update: server,
                    create: server,
                });
                helper.ResponseJSON = result;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
                console.error(e);
            }
        }
        
    }
    
    return helper.Response;
}