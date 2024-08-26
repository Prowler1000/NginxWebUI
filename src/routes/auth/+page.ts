import type { PageLoad } from "./$types";
import { GetAllAuthConfigs } from "$lib/api";

export const load: PageLoad = async (e) => {
    const auths = await GetAllAuthConfigs(e.fetch);
    return {
        auths: auths,
    };
}