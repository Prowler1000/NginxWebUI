import prisma from "$lib/server/db";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { Server } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

/*
    I suppose only PUT or PATCH should be used for this end point but I don't think there's any harm in accepting
    POST requests, even if it's counter-intuitive, as long as we still accept the standard
*/

// Make all properties of Server optional except for ID
type ServerPatch = Partial<Omit<Server, 'id'>>
type PatchRequestBody = ServerPatch & {id: number}

type PutRequestBody = {
    id: number, // The ID of the resource to overwrite
    data: Server, // The new data to overwrite the resource with
}

export const PUT: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as PutRequestBody;
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError("ID of the resource to overwrite not supplied.")
        }
        else if (!('data' in json)) {
            helper.SetClientError("Data to overwrite resource with not supplied.")
        }
        else {
            try {
                const res = await prisma.server.update({
                    where: {
                        id: json.id,
                    },
                    data: json.data,
                })
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. \n\n${e}`)
            }
        }
    }
    return helper.Response;
}

export const PATCH: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as PatchRequestBody;
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError("ID of resource to update not supplied.")
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {id, ...update_data} = json;
            try {
                const res = await prisma.server.update({
                    where: {
                        id: json.id,
                    },
                    data: update_data,
                })
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. \n\n${e}`)
            }
        }
    }
    return helper.Response;
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as PatchRequestBody;
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError("ID of resource to update not supplied.")
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {id, ...update_data} = json;
            try {
                const res = await prisma.server.update({
                    where: {
                        id: json.id,
                    },
                    data: update_data,
                })
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database. \n\n${e}`)
            }
        }
    }
    return helper.Response;
}
