<script lang="ts">
	import { onMount } from "svelte";

    $: serversList = []
    onMount(async () => {
        serversList = await (await fetch("api/v1/servers/Get-Servers")).json()
    })
</script>

<div class="server-ctr">
    {#each serversList as server}
        <div>
            {server["id"]}
            {server["name"]}
            {server["hostname"]}
            {server["http_port"]}
            {server["ssl_port"]}
        </div>
    {/each}
</div>

<style>

</style>