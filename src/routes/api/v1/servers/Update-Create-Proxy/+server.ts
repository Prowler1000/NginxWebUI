import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { ProxyServer } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson();
    if (helper.OK) {
        if (!("id" in json)) {
            helper.SetClientError("id not supplied.");
        }
        else {
            const request_proxy = json as ProxyServer;
            const proxy = {
                forward_scheme: request_proxy.forward_scheme,
                forward_server: request_proxy.forward_server,
                forward_port: request_proxy.forward_port,
                serverId: request_proxy.serverId
            }
            const id = request_proxy.id;
            try {     
                const result = await prisma.proxyServer.upsert({
                    where: {
                        id: id,
                    },
                    update: proxy,
                    create: proxy,
                });
                helper.ResponseJSON = result;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
            }
        }
    }
    return helper.Response;
}