import type { RequestHandler } from "@sveltejs/kit";
import path from "path";
import fs from "fs";
import { GenerateNginxConfig, GenerateSiteConfigs } from "$lib/server/ConfigGenerator";
import { ParseBoolean } from "$lib/server/parser";
import { ResponseHelper } from "$lib/server/RESTHelpers";

interface ConfVars {
    prefix: boolean,
    nginx_config_dir: string,
    nginx_config_name: string,
    sites_config_dir: string,
}

function GetEnvVars(): ConfVars {
    return {
        prefix: ParseBoolean(process.env.NWEBUI_PREFIX_CWD ?? false),
        nginx_config_dir: process.env.NWEBUI_NGINX_CONFIG_DIR ?? "/config/nginx",
        nginx_config_name: process.env.NWEBUI_NGINX_CONFIG_NAME ?? "nginx.conf",
        sites_config_dir: process.env.NWEBUI_SITES_CONFIG_DIR ?? "/config/sites"
    }
}

export const POST: RequestHandler = async ({ request }) => {
    const vars = GetEnvVars();
    const nginx_config_dir = vars.prefix ? path.join(process.cwd(), vars.nginx_config_dir) : vars.nginx_config_dir;
    const nginx_config_file = path.join(nginx_config_dir, vars.nginx_config_name);
    const nginx_config = await GenerateNginxConfig();
    fs.mkdir(nginx_config_dir, { recursive: true }, () => {fs.writeFile(nginx_config_file, nginx_config, {}, () => {});})

    const sites_config_dir = vars.prefix ? path.join(process.cwd(), vars.sites_config_dir) : vars.sites_config_dir;
    const sites = await GenerateSiteConfigs();
    fs.rmSync(sites_config_dir, {recursive: true, force: true});
    fs.mkdir(sites_config_dir, { recursive: true}, () => {
        for (const site_name in sites) {
            const filename = site_name + ".conf";
            const file_path = path.join(sites_config_dir, filename);
            fs.writeFile(file_path, sites[site_name], {}, () => {});
        }
    })
    return new ResponseHelper("Files deployed.")
        .Status(200)
        .Response;
}