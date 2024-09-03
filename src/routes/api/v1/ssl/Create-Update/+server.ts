import prisma from "$lib/server/db";
import { ContentType, RequestHelper } from "$lib/server/RESTHelpers";
import type { SSLConfig } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper({expectedContentType: ContentType.JSON}, request);
    const json = await helper.GetJson();
    if (helper.OK) {
        if ('id' in json) {
            try {
                const result = await prisma.sSLConfig.upsert({
                    where: {
                        id: json.id as number,
                    },
                    update: json as SSLConfig,
                    create: json as SSLConfig,
                });
                helper.ResponseJSON = result;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. ${e}`);
                console.error(e);
            }
        }
        else {
            helper.SetClientError('ID not specified.');
        }
    }
    return helper.Response;
}