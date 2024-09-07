import assert from "assert";

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

export function ParseBoolean(bool_like: string | boolean): boolean
export function ParseBoolean(bool_like: string | undefined): boolean | undefined
export function ParseBoolean(bool_like: string | boolean | undefined): boolean | undefined {
    return typeof bool_like === "boolean"
    ? bool_like
    : typeof bool_like === "undefined"
    ? undefined
    : (bool_like.toLowerCase() === "true" || bool_like.toLowerCase() == "1");
}

export function ParseInt(int_like: string | number): number
export function ParseInt(int_like: string | undefined): number | undefined
export function ParseInt(int_like: string | number | undefined): number | undefined {
    return typeof int_like === "number"
    ? int_like
    : typeof int_like === "string"
    ? Number(int_like)
    : undefined
}

export function ParseNum(num_like: string): number
export function ParseNum(num_like: string | undefined): number | undefined
export function ParseNum(num_like: string | undefined): number | undefined {
    return num_like !== undefined
        ? Number(num_like)
        : undefined
}

export function ParseNumArray(array_like: string): number[]
export function ParseNumArray(array_like: string | undefined): number[] | undefined {
    const array = array_like ? [] as number[] : undefined;
    if (array && array_like) {
        for (const value of array_like.split(",")) {
            array.push(Number(value));
        }
    }
    return array
}

export function ParseNumArrayQuery(array_like: string | undefined): {in: number[]} | undefined {
    return array_like === undefined ? undefined : { in: ParseNumArray(array_like) };
}

export function ValidEnum<T>(def: Record<string, T>, enum_like: string | undefined): boolean {
    return ParseEnum(def, enum_like) !== undefined;
}

export function ParseEnum<T>(def: Record<string, T>, enum_like: T | string | undefined): T | undefined {
    let value: T | undefined;
    if (typeof enum_like === "string") {
        const enumKey = Object.keys(def).find(key => key.toLowerCase() === enum_like.replace(" ","").toLowerCase());
        value = enumKey !== undefined ? def[enumKey] : undefined;
    }
    else {
        value = enum_like;
    }
    return value;
}

export function ParseEnumArray<T>(def: Record<string, T>, array_like: string): T[]
export function ParseEnumArray<T>(def: Record<string, T>, array_like: string | undefined): T[] | undefined {
    const array = array_like === undefined ? undefined : [] as T[];
    if (array && array_like) {
        for (const value of array_like.split(",")) {
            const asEnum = ParseEnum(def, value);
            if (asEnum === undefined) {
                // Currently does nothing, but important to not forget about implementing later
                assert(asEnum !== undefined);
            }
            else {
                array.push(asEnum);
            }
        }
    }
    return array;
}