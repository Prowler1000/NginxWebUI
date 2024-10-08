import type { PageLoad } from "./$types";
import { GetAllAuthConfigs, GetAllProxyServers, GetAllSSLConfigs } from "$lib/api";

export const load: PageLoad = async (e) => {
    const proxies = await GetAllProxyServers(e.fetch);
    const auths = await GetAllAuthConfigs(e.fetch);
    const sslconfigs = await GetAllSSLConfigs(e.fetch);
    return {
        servers: proxies,
        auths: auths,
        ssl_configs: sslconfigs,
    };
}