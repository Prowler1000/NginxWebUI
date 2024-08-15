<script lang="ts">
	import { Prisma, Scheme, type ProxyServer } from "@prisma/client";
	import ServerItem from "../../components/ServerItem.svelte";
	import { onMount } from "svelte";

    interface dataServerType {
        id: number;
        enable: boolean;
        name: string;
        hostname: string;
        http_port: number;
        ssl_port: number;
        use_ssl: boolean;
        forward_scheme: Scheme;
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
        forward_scheme: Scheme.HTTP,
        forward_server: "",
        forward_port: 0,
        serverId: 0,
    }

    function add_server() {
        for (let s of servers) {
            console.log(s.id);
        }
        servers.push(default_proxy)
    }

    function on_save() {
        sortServers();
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

            save_callback={on_save}
        />
    {/each}
    <button onclick={add_server}>Add Server</button>
</div>

<style>
    
</style>