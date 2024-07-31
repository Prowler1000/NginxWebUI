<script lang="ts">
	import ServerItem from "../../components/ServerItem.svelte";

    const {
        data
    } = $props();

</script>

<div class="server-ctr">
    {#each data.servers as server}
        <ServerItem
            id={server.id}
            name={server.name}
            hostname={server.hostname}
            http_port={server.http_port}
            ssl_port={server.ssl_port}
            enabled_headers={server.headers}
            all_headers={data.headers}
        />
    {/each}
</div>

<style>
    
</style>