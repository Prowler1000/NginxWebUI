import { GenerateSiteConfigs } from "$lib/server/ConfigGenerator"
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const configs = await GenerateSiteConfigs();
    return json(configs);
}