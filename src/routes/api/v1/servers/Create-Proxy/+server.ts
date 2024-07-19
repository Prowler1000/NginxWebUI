import { ParseEnum, ValidEnum } from "$lib/server/parser";
import { ResponseHelper, Status } from "$lib/server/responseHelper";
import { Scheme } from "@prisma/client";
import assert from "assert";

interface ProxyObject {
    serverId: number
    forward_scheme: Scheme,
    forward_server: string,
    forward_port: number,
}

function ParseProxyObject(data: Record<string,string>): ProxyObject {
    assert(data["forward-scheme"] === undefined || ValidEnum(Scheme, data["forward-scheme"]));
    const scheme = ParseEnum(Scheme, data["forward-scheme"]) ?? Scheme.HTTP;
    return {
        serverId: Number(data["serverId"]),
        forward_scheme: scheme,
        forward_server: data["forward-server"],
        forward_port: Number(data["forward-port"])
    }
}

const RequiredFields = [
    "serverId",
    "forward-server",
    "forward-port",
]

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
    if (request.headers.get("Content-Type") !== "application/json") {
        return new ResponseHelper()
            .Body(`Invalid request type. Expected application/json, got ${request.headers.get("Content-Type")}`)
            .Status(Status.BAD_REQUEST)
            .Response;
    }
    let data: Record<string, Record<string, string>>;
    try {
        data = await request.json();
    }
    catch {
        return new ResponseHelper()
            .Body("Error parsing request json.")
            .Status(Status.BAD_REQUEST)
            .Response;
    }
    // If at least 1 value in 'data' does not have every value in RequiredFields
    if (Object.values(data).some(x => !RequiredFields.every(y => y in x))) {
        return new ResponseHelper()
            .Body(`One or more entries are missing one of the required attributes: ${RequiredFields}`)
            .Status(Status.BAD_REQUEST)
            .Response;
    }
    // Every object must either have an undefined forward-scheme or a valid forward-scheme
    if (!Object.values(data).every(x => !("forward-scheme" in x) || ValidEnum(Scheme, x["forward-scheme"]))) {
        return new ResponseHelper()
            .Body(`One or more entries have an invalid forward-scheme value. Values must either be valid schemes or undefined.`)
            .Status(Status.BAD_REQUEST)
            .Response;
    }
    const ProxyObjects: Array<ProxyObject> = [];
    for (const key in data) {
        ProxyObjects.push(ParseProxyObject(data[key]))
    }
}