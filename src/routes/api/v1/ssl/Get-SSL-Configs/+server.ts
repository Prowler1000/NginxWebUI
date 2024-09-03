import prisma from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";


export const GET: RequestHandler = async ({ url }) => {
    const res = await prisma.sSLConfig.findMany();
    return json(res);
}