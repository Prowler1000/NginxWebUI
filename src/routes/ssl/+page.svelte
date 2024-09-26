<script lang="ts">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
	import { CreateSSLConfig, DeleteSSLConfig, UpdateSSLConfig } from '$lib/api.js';
    import type { SSLConfig } from '@prisma/client';
	import Table from '../../components/DataTable/Table.svelte';

    const {
        data
    } = $props();

    let table: Table<SSLConfig>;

    const label_map: { [K in keyof SSLConfig]?: string } = {
        'id': "ID",
        'name': "Name",
        'cert_location': "Certificate Locations",
        'cert_key_location': "Key Location",
        'session_timeout': "Session Timeout",
        'session_cache': "Session Cache",
        'session_tickets': "Session Tickets",
        'prefer_server_ciphers': "Prefer Server Ciphers",
        'stapling': "SSL Stapling",
        'stapling_verify': "Verify SSL Stapling",
    }

    const editable_headers: (keyof SSLConfig)[] = [
        'name',
        'cert_location',
        'cert_key_location',
        'session_timeout',
        'session_cache',
        'session_tickets',
        'prefer_server_ciphers',
        'stapling',
        'stapling_verify',
    ]

    const display_headers: (keyof SSLConfig)[] = [
        'id',
    ]

    const new_ssl_config: SSLConfig = {
        id: 0,
        name: "",
        cert_location: "",
        cert_key_location: "",
        session_timeout: "1d",
        session_cache: "shared:MozSSL:10m",
        session_tickets: false,
        protocols: ["TLSv1.3"],
        prefer_server_ciphers: false,
        stapling: true,
        stapling_verify: true,
    }

    function new_config() {
        table.add_value(structuredClone(new_ssl_config));
    }

    async function save(data: SSLConfig): Promise<SSLConfig> {
        if (data.id === 0) {
            const res = await CreateSSLConfig(data);
            if (res !== null) {
                return res
            }
            else {
                return data;
            }
        }
        else {
            const res = await UpdateSSLConfig(data);
            if (res !== null) {
                return res
            }
            else {
                return data;
            }
        }
    }

    async function del(data: SSLConfig): Promise<boolean> {
        let deleted = false;
        if (data.id !== 0) {
            deleted = await DeleteSSLConfig(data.id);
        }
        return deleted;
    }

</script>

<div class="page-ctr">
    <Table bind:this={table}
        data={data.SSLConfigs}
        header_keys={editable_headers}
        display_value_keys={display_headers}
        key_label_map={label_map}
        save_callback={save}
        delete_callback={del}
    />
    <button onclick={new_config}>New SSL Config</button>
</div>

<style>

.primary-ctr {
    display: flex;
    padding: 10px;
    border-bottom: 2px solid black;
}
.input-ctr {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    margin: 0 5px 0 5px;
    text-align: center;
}
.control-ctr {
    display: flex;
    flex-grow: 1;
    margin: auto auto auto 10px;
    height: 100%;
    justify-content: center;

}
.control-ctr * {
    margin: auto 5px;
}

:global(.grayed-out) {
    filter: contrast(0);
}

</style>