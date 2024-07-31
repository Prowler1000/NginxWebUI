import type { PageLoad } from "./$types";
import { GetAllHeaders, GetAllServers } from "$lib/api";

export const load: PageLoad = async (e) => {
    const serverArray = await GetAllServers(e.fetch);
    const headerArray = await GetAllHeaders(e.fetch);
    return {
        servers: serverArray,
        headers: headerArray,
    };
}