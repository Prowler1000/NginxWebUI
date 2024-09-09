import { GetAllStreams } from "$lib/api";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (e) => {
    const streams = await GetAllStreams(e.fetch);
    return {
        streams: streams,
    }
}