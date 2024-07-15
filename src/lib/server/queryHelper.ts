
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