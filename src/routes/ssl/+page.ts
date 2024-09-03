import { GetAllSSLConfigs } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (e) => {
    const configs = await GetAllSSLConfigs(e.fetch);
    return {
        SSLConfigs: configs,
    }
}