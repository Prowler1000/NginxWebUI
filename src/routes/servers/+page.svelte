<script lang="ts">
	import ServerItem from "../../components/ServerItem.svelte";

    const {
        data
    } = $props();
    
    data.servers.sort((a, b) => a.id - b.id);

</script>

<div class="server-ctr">
    {#each data.servers as server}
        <ServerItem
            id={server.id}
            enabled={server.enable}
            name={server.name}
            hostname={server.hostname}
            http_port={server.http_port}
            ssl_port={server.ssl_port}
            use_ssl={server.use_ssl}
            scheme={server.forward_scheme}
            forward_server={server.forward_server}
            forward_port={server.forward_port}
            server_id={server.serverId}
        />
    {/each}
</div>

<style>
    
</style>