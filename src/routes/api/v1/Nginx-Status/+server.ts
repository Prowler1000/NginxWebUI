import type { RequestHandler } from "@sveltejs/kit";
import util from 'util';
import { exec } from "child_process";
import { RequestHelper } from "$lib/server/RESTHelpers";

const asyncExec = util.promisify(exec);
const cmd = "/command/s6-svstat /var/run/service/nginx"

export const GET: RequestHandler = async ({ url }) => {
    const helper = new RequestHelper();
    try {
        const { stdout, stderr } = await asyncExec(cmd);
        const up = stdout.includes("up");
        helper.ResponseJSON = {up: up}
    }
    catch (e) {
        helper.SetInternalError("Command failed with the following exception.\n" + e);
    }
    return helper.Response;
}