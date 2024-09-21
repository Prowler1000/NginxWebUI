<script lang="ts">
	import type { ProxyServer, Server } from "@prisma/client";
	import Table from "../../components/DataTable/Table.svelte";
	import TableSelect from "../../components/DataTable/TableSelect.svelte";
	import { CreateProxyServer, CreateServer, DeleteProxyServer, DeleteServer, UpdateProxyServer, UpdateServer } from "$lib/api";

    enum Scheme {
        HTTP = "HTTP",
        HTTPS = "HTTPS",
    }

    type ServerType = ProxyServer & Server

    const {
        data
    } = $props();

    let table: Table<ServerType>;

    const default_proxy: ServerType = {
        id: 0,
        enable: true,
        name: "",
        hostname: "",
        http_port: 80,
        ssl_port: 443,
        use_ssl: true,
        forward_scheme: "HTTP",
        forward_server: "",
        forward_port: 0,
        serverId: 0,
        authId: null,
        sSLConfigId: null,
        worker_access: false,
    }

    function add_server() {
        table.add_value(structuredClone({
            ...default_proxy,
            forward_scheme: "HTTP" as Scheme
        }))
    }
    const key_labels: {[K in keyof Partial<ServerType>]: string} = {
        ["id"]: "ID",
        ["name"]: "Name",
        ["enable"]: "Enable",
        ["hostname"]: "Hostname",
        ["http_port"]: "HTTP Port",
        ["ssl_port"]: "SSL Port",
        ["use_ssl"]: "Use SSL",
    }

    const header_keys: string[] = [
        "enable",
        "name",
        "hostname",
        "http_port",
        "ssl_port",
        "use_ssl",
    ]

    function extract_server_object(data: ServerType): Server {
        const {
            forward_scheme, 
            forward_server, 
            forward_port, 
            serverId, 
            ...server
        } = data;
        return {
            ...server,
            id: data.serverId,
        }
    }

    function extract_proxy_object(data: ServerType): ProxyServer {
        const {
            id,
            forward_scheme,
            forward_server,
            forward_port,
            serverId,
        } = data;
        return {
            id,
            forward_scheme,
            forward_server,
            forward_port,
            serverId,
        }
    }

    function merge_server_objects(server: Server, proxy: ProxyServer): ServerType {
        return {
            ...server,
            ...proxy,
            id: proxy.id,
            serverId: server.id
        }
    }

    async function save_callback(data: ServerType): Promise<ServerType | undefined> {
        const server = extract_server_object(data);
        let proxy = extract_proxy_object(data);
        let new_server: Server | null;
        let new_proxy: ProxyServer | null = null;
        if (server.id === 0) {
            new_server = await CreateServer(server)
        }
        else {
            new_server = await UpdateServer(server);
        }
        if (new_server !== null) {
            proxy = {...proxy, serverId: new_server.id};
            if (proxy.id === 0) {
                new_proxy = await CreateProxyServer(proxy);
            }
            else {
                new_proxy = await UpdateProxyServer(proxy);
            }
        }
        else {
            return undefined
        }
        if (new_proxy === null && new_server !== null) {
            await DeleteServer(new_server.id);
            return undefined
        }
        return merge_server_objects(new_server, new_proxy!);
    }

    async function delete_callback(data: ServerType): Promise<boolean> {
        const deleted_proxy = await DeleteProxyServer(data.id);
        if (deleted_proxy) {
            return await DeleteServer(data.serverId);
        }
        return false;
    }

</script>

<div class="server-ctr">
    <Table bind:this={table}
        data={data.servers}
        key_label_map={key_labels}
        display_value_keys={["id"]}
        header_keys={header_keys}
        save_callback={save_callback}
        delete_callback={delete_callback}
    >
        {#snippet details(server, callback)}
            <div class="general-settings-ctr">
                <div class="auth-settings-ctr settings-ctr">
                    <TableSelect
                        title="Auth Settings:"
                        options={data.auths}
                        key_prop={"id"}
                        name_prop={"name"}
                        value={server.authId}
                        nullable
                        nullable_name="Disabled"
                        onselectchange={(e) =>
                            callback("authId", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))
                        }
                    />
                </div>
                <div class="ssl-settings-ctr settings-ctr">
                    <TableSelect
                        title="SSL Settings:"
                        options={data.ssl_configs}
                        key_prop={"id"}
                        name_prop={"name"}
                        value={server.sSLConfigId}
                        nullable
                        onselectchange={(e) =>
                            callback("sSLConfigId", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))
                        }
                    />
                </div>
                <div class="worker-access-ctr settings-ctr">
                    <div class="worker-access-title">
                        Web Workers:
                    </div>
                    <div class="worker-access-setting">
                        <input type="checkbox" checked={server.worker_access} onchange={(e) =>
                            callback("worker_access", e.currentTarget.checked)
                        }/>
                    </div>
                </div>
            </div>
            <div class="proxy-settings-ctr">
                <div class="proxy-settings-title">
                    Proxy Settings:
                </div>
                <div class="proxy-settings-inputs">
                    <div class="proxy-setting">
                        <label for="scheme">Forward Scheme:</label>
                        <select id="scheme" value={server.forward_scheme} onchange={(e) => callback("forward_scheme", e.currentTarget.value)}>
                            <option value="HTTP">HTTP</option>
                            <option value="HTTPS">HTTPS</option>
                        </select>
                    </div>
                    <div class="proxy-setting">
                        <label for="fwd_server_input">Forward Server:</label>
                        <div class="input-ctr"> <input id="fwd_server_input" type="text" value={server.forward_server} oninput={(e) => callback("forward_server", e.currentTarget.value)}/> </div>
                    </div>
                    <div class="proxy-setting">
                        <label for="fwd_port_input">Forward Port:</label>
                        <div class="input-ctr"> <input id="fwd_port_input" type="number" value={server.forward_port} oninput={(e) => callback("forward_port", Number(e.currentTarget.value))}/> </div>
                    </div>
                </div>
            </div>
        {/snippet}
    </Table>
    <div class="btn-ctr">        
        <button onclick={add_server}>Add Server</button>
    </div>
</div>

<style>
    .server-ctr {
        display: flex;
        flex-direction: column;
    }
    .general-settings-ctr {
        display: flex;
        justify-content: center;
    }
    .settings-ctr {
        margin: 0 10px 10px 10px;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .settings-ctr * {
        margin: auto;
    }

    .auth-settings-ctr {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .auth-settings-ctr *{
        margin: auto;
    }

    .proxy-settings-ctr {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .proxy-settings-title {
        margin: auto;
    }
    .proxy-settings-inputs {
        margin: auto;
        width: 100%;
    }
    .proxy-setting {
        display: flex;
        margin: 5px;
    }
    .proxy-setting label {
        width: 50%;
        text-align: right;
    }
    .btn-ctr {
        display: flex;
        align-items: center;
        width: 100%;
        margin-top: 50px;
    }
    button {
        margin: auto;
        width: 15%;
        font-size: large;
        padding: 10px;
    }
</style>