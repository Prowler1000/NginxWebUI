import { ParseEnumArray } from "./parser"

export const stringQueryGen = (parameter: string | undefined , exact: boolean, match_case: boolean): {
    equals: string | undefined,
    contains: string | undefined,
    mode: "default" | "insensitive"
} | undefined => {
    return parameter !== undefined 
    ? {
        equals: exact ? parameter : undefined,
        contains: exact? undefined : parameter,
        mode: match_case ? "default" : "insensitive",
    } 
    : undefined
}

export function enumArrayQueryGen<T>(enumDef: Record<string, T>, array_like: string | undefined, field_is_array: true): { hasEvery: T[] } | undefined;
export function enumArrayQueryGen<T>(enumDef: Record<string, T>, array_like: string | undefined, field_is_array: false): { in: T[] } | undefined;
export function enumArrayQueryGen<T>(enumDef: Record<string, T>, array_like: string | undefined, field_is_array: boolean): 
{ in: T[]} | 
{ hasEvery: T[] } | 
undefined {
    return array_like === undefined 
        ? undefined
        : field_is_array
        ? { hasEvery: ParseEnumArray(enumDef, array_like)}
        : { in: ParseEnumArray(enumDef, array_like)}
}