<script lang="ts">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
import { CreateStream, DeleteStream, UpdateStream } from '$lib/api';
	import type { Stream } from '@prisma/client';
	import Table from '../../components/DataTable/Table.svelte';

    const {
        data
    } = $props();

    const label_map: {[K in keyof Stream]: string} = {
        'id': 'ID',
        'name': "Name",
        'incomming_port': "Incomming Port",
        'upstream_host': "Upstream Host",
        'upstream_port': "Upstream Port",
    }

    const display_keys: (keyof Stream)[] = [
        'id',
    ]

    const editable_keys: (keyof Stream)[] = [
        'name',
        'incomming_port',
        'upstream_host',
        'upstream_port',
    ]

    const default_stream: Stream = {
        id: 0,
        name: "Default",
        incomming_port: 0,
        upstream_host: "",
        upstream_port: 0,
    };

    function new_stream() {
    }

    async function save(data: Stream): Promise<Stream> {
        if (data.id === 0) {
            const res = await CreateStream(data);
            if (res !== null) {
                return res;
            }
            else {
                console.error("An error occured while saving.");
                return data;
            }
        }
        else {
            const res = await UpdateStream(data);
            if (res !== null) {
                return res;
            }
            else {
                console.error("An error occured while saving.");
                return data;
            }
        }
    }

    async function del(data: Stream): Promise<boolean> {
        return await DeleteStream(data.id);
        
    }

</script>

<div class="page-ctr">
    <Table
        data={data.streams}
        key_label_map={label_map}
        display_value_keys={display_keys}
        header_keys={editable_keys}
        save_callback={save}
        delete_callback={del}
    />
    <div class="btn-ctr">
        <button class="new-stream-btn" onclick={new_stream}>New Stream</button>
    </div>
</div>

<style>
    .page-ctr {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-items: center;
        align-items: center;
    }
    .stream-ctr {
        display: flex;
        width: 100%;
        padding: 10px;
    }
    .input-ctr {
        margin: auto;
    }
</style>