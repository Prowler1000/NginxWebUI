export function parseSearchParams(searchParams: string): Record<string, string | undefined> {
    const dict: Record<string, string> = {};
    if (searchParams.length > 0) {
        searchParams = searchParams.replace('?', '');
        const params = searchParams.split('&');
        for (const param of params) {
            const kvp = param.split('=');
            dict[kvp[0]] = kvp[1];
        }
    }

    return dict;
}