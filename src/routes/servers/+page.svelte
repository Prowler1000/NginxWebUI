<script lang="ts">
	import { onMount } from "svelte";
	import ServerItem from "../../components/ServerItem.svelte";

    enum Scheme {
        HTTP = "HTTP",
        HTTPS = "HTTPS",
    }

    interface dataServerType {
        id: number;
        enable: boolean;
        name: string;
        hostname: string;
        http_port: number;
        ssl_port: number;
        use_ssl: boolean;
        forward_scheme: "HTTP" | "HTTPS";
        forward_server: string;
        forward_port: number;
        serverId: number;
    }

    const {
        data
    } = $props();

    let servers = $state(data.servers);
    
    onMount(() => {
        sortServers();
    })

    const default_proxy = {
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
    }

    function add_server() {
        if (servers.some(x => x.id === 0)) {
            return; // Early return if we already have an unsaved server
        }
        servers.push(structuredClone({
            ...default_proxy,
            forward_scheme: "HTTP" as Scheme
        }));
    }

    function on_save() {
        sortServers();
    }

    function on_delete(id: number) {
        servers = servers.filter(x => x.id !== id);
    }

    const sortId = (a: dataServerType, b: dataServerType) => {
            return a.id - b.id;
    }
    const sortName = (a: dataServerType, b: dataServerType) => {
        if (a.name < b.name) return -1;
        else if (b.name > a.name) return 1;
        else return 0;
    }
    function sortServers() {
        servers.sort(sortName);
    }
</script>

<div class="server-ctr">
    <div class="header">
        <div>
            Name
        </div>
        <div>
            Hostname
        </div>
        <div style="width: 5%;">
            HTTP Port
        </div>
        <div style="width: 5%; margin-right: 13%;">
            SSL Port
        </div>
    </div>
    {#each servers as server}
        <ServerItem
            bind:id={server.id}
            bind:enabled={server.enable}
            bind:name={server.name}
            bind:hostname={server.hostname}
            bind:http_port={server.http_port}
            bind:ssl_port={server.ssl_port}
            bind:use_ssl={server.use_ssl}
            bind:scheme={server.forward_scheme}
            bind:forward_server={server.forward_server}
            bind:forward_port={server.forward_port}
            bind:server_id={server.serverId}
            bind:authId={server.authId}
            bind:ssl_config_id={server.sSLConfigId}
            auths={data.auths}
            SSLConfigs={data.ssl_configs}

            save_callback={on_save}
            delete_callback={() => on_delete(server.id)}
            default_show_details={server.id === 0}
        />
    {/each}
    <div class="btn-ctr">        
        <button onclick={add_server}>Add Server</button>
    </div>
</div>

<style>
    .server-ctr {
        display: flex;
        flex-direction: column;
    }
    .header {
        display: flex;
        width: calc(100%, -10px);
        margin: 10px;
        justify-content: center;
    }
    .header * {
        width: 10%;
        text-align: center;
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