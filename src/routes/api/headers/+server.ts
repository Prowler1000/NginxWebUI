import type { RequestHandler } from "./$types";
import { parseSearchParams } from "$lib/server/parseParams";
import prisma from "$lib/server/db";

/*  Parameters
    id?:                Int | Int[]
    name?:              String      (Match exact name)
    name-contains?:     String      (Match partial name)
    value?:             String      (Match exact value)
    value-contains?:    String      (Match partial value)
    match-case?:        Boolean     (Whether to match case, defaults to true)
    max?:               Int         (Max number of matches to return, defaults to all)
*/

export const GET: RequestHandler = async ({ url }) => {
    const params = parseSearchParams(url.search);
    let ids = undefined
    if (params["id"]) {
        ids = []
        for (const id of params["id"].split(",")) {
            ids.push(Number(id));
        }
    }
    const match_case = params["match-case"] != undefined ? Boolean(params["match-case"]) : true;
    const max = Number(params["max"] || "-1");
    
    const results = await prisma.header.findMany({
        where: {
            id: {
                in: ids
            },
            name: {
                equals: params["name"],
                contains: params["name-contains"],
                mode: match_case ? "default" : "insensitive"
            },
            value: {
                equals: params["value"],
                contains: params["value-contains"],
                mode: match_case ? "default" : "insensitive"
            }
        },
        take: max > -1 ? max : undefined
    })
    return new Response(JSON.stringify(results));
}

/*
    {
        <header 0 name>: <header 0 value>,
        <header 1 name>: <header 1 value>,
    }
*/

export const POST: RequestHandler = async ({ request }) => {
    if (request.headers.get("Content-Type") !== "application/json") {
        return new Response(`Invalid request type. Expected application/json, got ${request.headers.get("Content-Type")}`, {
            status: 400
        });
    }
    let data: Record<string, string>;
    try {
        data = await request.json();
    }
    catch {
        return new Response("Error parsing request json.", {
            status: 400
        })
    }
    const createData: Array<{name: string, value: string | undefined}> = []
    for (const key in data) {
        createData.push({
            name: key,
            value: data[key].length > 0 ? data[key] : undefined
        })
    }
    const result = await prisma.header.createMany({
        data: createData,
        skipDuplicates: true,
    });
    return new Response(`Created ${result.count} headers.`, {status: 200});
}