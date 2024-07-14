import { HTTP_VERSION, SSL_Protocol } from "@prisma/client";

export function ParseSearchParams(searchParams: string): Record<string, string | undefined> {
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

export function ParseBoolean(bool_like: string | boolean): boolean;
export function ParseBoolean(bool_like: string | undefined): boolean | undefined 
export function ParseBoolean(bool_like: string | boolean | undefined): boolean | undefined {
    return typeof bool_like === "boolean"
    ? bool_like
    : typeof bool_like === "undefined"
    ? undefined
    : (bool_like.toLowerCase() === "true" || bool_like.toLowerCase() == "1");
}


export function ParseInt(int_like: string | number): number {
    return typeof int_like === "number"
    ? int_like
    : Number(int_like)
}

export function ParseNumArray(array_like: string | undefined): number[] | undefined {
    const array = array_like ? [] as number[] : undefined;
    if (array && array_like) {
        for (const value of array_like.split(",")) {
            array.push(Number(value));
        }
    }
    return array
}

export function ParseHTTPVersionArray(array_like: string | undefined): HTTP_VERSION[] | undefined {
    const array = array_like ? [] as HTTP_VERSION[] : undefined;
    if (array && array_like) {
        for (const value of array_like.replace(" ", "").split(",")) {
            if (value in HTTP_VERSION) {
                array.push(HTTP_VERSION[value as keyof typeof HTTP_VERSION]);
            }
        }
    }
    return array;
}

export function ParseSSLProtocolArray(array_like: string | undefined): SSL_Protocol[] | undefined {
    const array = array_like ? [] as SSL_Protocol[] : undefined;
    if (array && array_like) {
        for (const value of array_like.replace(" ", "").split(",")) {
            if (value in SSL_Protocol) {
                array.push(SSL_Protocol[value as keyof typeof SSL_Protocol]);
            }
        }
    }
    return array;
}
export function ParseEnum<T>(def: Record<string, T>, enum_like: string | undefined): T | undefined {
    let value: T | undefined;
    if (enum_like && enum_like.replace(" ", "") in def) {
        value = def[enum_like]
    }
    return value;
}
