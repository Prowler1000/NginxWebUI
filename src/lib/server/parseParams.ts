export function parseSearchParams(searchParams: string): Record<string, string | undefined> {
    const dict: Record<string, string> = {};
    if (searchParams.length > 0) {
        searchParams = searchParams.replace('?', '');
        const params = decodeURI(searchParams).split('&');
        for (const param of params) {
            const kvp = param.split('=');
            dict[kvp[0]] = kvp[1];
        }
    }

    return dict;
}

export function ParseBoolean(bool_like: string | boolean | undefined): boolean {
    return typeof bool_like === "boolean" 
    ? bool_like 
    : bool_like !== undefined && (bool_like.toLowerCase() === "true" || bool_like.toLowerCase() === "1");
}