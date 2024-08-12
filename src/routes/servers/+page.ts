import type { PageLoad } from "./$types";
import { GetAllProxyServers } from "$lib/api";

export const load: PageLoad = async (e) => {
    const proxies = await GetAllProxyServers(e.fetch);
    return {
        servers: proxies,
    };
}