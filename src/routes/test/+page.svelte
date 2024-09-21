<script lang="ts">
    import type { Server } from "@prisma/client";
    import Table from "../../components/DataTable/Table.svelte";


    const {
        data
    } = $props();

    const key_labels: {[K in keyof Partial<Server>]: string} = {
        ["id"]: "ID",
        ["enable"]: "Enable",
        ["hostname"]: "Hostname",
        ["http_port"]: "HTTP Port",
        ["ssl_port"]: "SSL Port",
        ["use_ssl"]: "Use SSL",
        ["worker_access"]: "Worker Access",
    }

    const header_keys: string[] = [
        "enable",
        "hostname",
        "http_port",
        "ssl_port",
        "use_ssl",
        "worker_access",
    ]

</script>

<div class="content">
    <Table 
        data={data.servers} 
        key_label_map={key_labels} 
        header_keys={header_keys}
        save_callback={(data) => {return data}}
        delete_callback={(data) => {return true}}
        >
        {#snippet details(server: Server, callback)}
            <div class="auth-settings-ctr settings-ctr">
                <div class="auth-settings-title">
                    Auth Settings:
                </div>
                <div class="auth-settings-select">
                    <select onchange={(e) => {
                        callback("authId", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))
                    }} value={server.authId}>
                        <option value={null} selected={server.authId === null}>Disabled</option>
                        {#each [{id: 1, name: "Authentik"}] as auth}
                            <option value={auth.id} selected={server.authId === auth.id}>{auth.name}</option>
                        {/each}
                    </select>
                </div>
            </div>
        {/snippet}
    </Table>
</div>

<style>

</style>