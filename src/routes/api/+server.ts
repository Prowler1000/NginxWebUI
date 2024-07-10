import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
    console.log(url.searchParams);
    return new Response(url);
}