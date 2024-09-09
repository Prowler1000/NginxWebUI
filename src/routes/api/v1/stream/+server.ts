import prisma from "$lib/server/db";
import { SearchParamsHelper } from "$lib/server/GetHelper";
import { ParseNum } from "$lib/server/parser";
import { RequestHelper } from "$lib/server/RESTHelpers";
import type { Stream } from "@prisma/client";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const helper = new RequestHelper();
    const params = new SearchParamsHelper(url.searchParams);
    try {
        const res = await prisma.stream.findMany({
            where: {
                id: ParseNum(params.grab("id")),
                incomming_port: ParseNum(params.grab("incomming_port")),
                upstream_host: params.grab("upstream_host"),
                upstream_port: ParseNum(params.grab("upstream_port")),
            }
        });
        helper.ResponseJSON = res;
    }
    catch (e) {
        helper.SetInternalError(`An error occured while accessing the database.\n\n${e}`);
    }
    return helper.Response;
}

export const POST: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as Omit<Stream, 'id'> & {id?: number};
    if (helper.OK) {
        if ('id' in json) {
            delete json['id'];
        }
        try {
            const res = await prisma.stream.create({
                data: json
            });
            helper.ResponseJSON = res;
        }
        catch (e) {
            helper.SetInternalError(`An error occured while accessing the database.\n\n${e}`);
        }
    }
    return helper.Response;
}

export const PUT: RequestHandler = async({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as {
        id: number,
        data: Stream
    };
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError("ID not specified. Cannot update resource without an ID.");
        }
        else if (!('data' in json)) {
            helper.SetClientError("Data not specified. Cannot update resource without data.");
        }
        else {
            try {
                const res = await prisma.stream.update({
                    where: {
                        id: json.id,
                    },
                    data: json.data,
                });
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database.\n\n${e}`);
            }
        }
    }
    return helper.Response;
}

export const DELETE: RequestHandler = async ({ request }) => {
    const helper = new RequestHelper(request);
    const json = await helper.GetJson() as {id?: number};
    if (helper.OK) {
        if (!('id' in json)) {
            helper.SetClientError('ID not specified. Cannot delete a resource without an ID to delete.');
        }
        else {
            try {
                const res = await prisma.stream.delete({
                    where: {
                        id: json.id,
                    },
                });
                helper.ResponseJSON = res;
            }
            catch (e) {
                helper.SetInternalError(`An error occured while accessing the database.\n\n${e}`);
            }
        }
    }
    return helper.Response
}