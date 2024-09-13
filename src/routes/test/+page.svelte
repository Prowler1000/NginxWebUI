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
    <Table data={data.servers} key_label_map={key_labels} header_keys={header_keys}>
        
    </Table>
</div>

<style>

</style>