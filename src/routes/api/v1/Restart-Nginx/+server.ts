import util from 'util';
import { exec } from "child_process";
import { ResponseHelper } from '$lib/server/RESTHelpers';

const asyncExec = util.promisify(exec);

export const POST = async ({ request }) => {

    const cmd = '/command/s6-svc -r /var/run/service/nginx'

    try {
        const { stdout, stderr } = await asyncExec(cmd, {
            timeout: 30,
        });
        return new ResponseHelper("Nginx restart command executed with the following output:\n" + `STDOUT::${stdout}\n\nSTDERR::${stderr}`)
            .Status(200)
            .Response;
    }
    catch (e) {
        return new ResponseHelper("Nginx restart command failed with the following exception.\n" + e)
            .Status(500)
            .Response;
    }
}