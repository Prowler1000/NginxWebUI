<script lang="ts">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
import { CreateStream, DeleteStream, UpdateStream } from '$lib/api';
	import type { Stream } from '@prisma/client';

    const {
        data
    } = $props();

    let streams = $state(data.streams.map(x => x));
    let saved_streams = $state(data.streams.map(x => x));
    let can_save = $state(data.streams.map(x => false));

    const default_stream: Stream = {
        id: 0,
        name: "Default",
        incomming_port: 0,
        upstream_host: "",
        upstream_port: 0,
    };

    function new_stream() {
        if (!streams.some(x => x.id === 0)) {
            streams.push(structuredClone(default_stream));
            can_save.push(true);
        }
    }

    function set_can_save() {
        streams.forEach((stream, i) => {
            const saved = saved_streams.find(x => x.id === stream.id);
            can_save[i] = saved === undefined || !Object.keys(saved).every(key => 
                saved[key as keyof Stream] === stream[key as keyof Stream]
            );
        })
    }

    let timeout: NodeJS.Timeout;
    function check_can_save() {
        clearTimeout(timeout);
        setTimeout(() => {
            set_can_save();
        }, 500);
    }

    async function save(index: number) {
        if (streams[index].id === 0) {
            const res = await CreateStream(streams[index]);
            if (res !== null) {
                streams[index] = structuredClone(res);
                saved_streams.push(structuredClone(res));
            }
            else {
                console.error("An error occured while saving.");
            }
        }
        else {
            const res = await UpdateStream(streams[index]);
            if (res !== null) {
                streams[index] = structuredClone(res);
                saved_streams[index] = structuredClone(res);
            }
            else {
                console.error("An error occured while saving.");
            }
        }
        set_can_save();
    }

    async function del(id: number) {
        if (id === 0) {
            streams = streams.filter(x => x.id !== 0);
        }
        else {
            await DeleteStream(id);
            streams = streams.filter(x => x.id !== id);
            saved_streams = saved_streams.filter(x => x.id !== id);
        }
    }

</script>

<div class="page-ctr">
    {#each streams as stream, index}
        <div class="stream-ctr">
            <div class="id-ctr input-ctr">
                ID: {stream.id}
            </div>
            <div class="name-ctr input-ctr">
                <label for="name-input">Name:</label>
                <input type="text" id="name-input" bind:value={stream.name} oninput={check_can_save}/>
            </div>
            <div class="in-port-ctr input-ctr">
                <label for="in-port-input">Incomming Port:</label>
                <input type="number" id="in-port-input" bind:value={stream.incomming_port} oninput={check_can_save}/>
            </div>
            <div class="upstream-host-ctr input-ctr">
                <label for="upstream-host-input">Upstream Host:</label>
                <input type="text" id="upstream-host-input" bind:value={stream.upstream_host} oninput={check_can_save}/>
            </div>
            <div class="upstream-port-ctr input-ctr">
                <label for="upstream-port-input">Upstream Port:</label>
                <input type="number" id="upstream-port-input" bind:value={stream.upstream_port} oninput={check_can_save}/>
            </div>
            <InteractableDiv oninteract={() => save(index)} class={can_save[index] ? '' : 'grayed-out'}>
                <span class="material-icons">save</span>
            </InteractableDiv>
            <InteractableDiv oninteract={() => del(stream.id)}>
                <span class="material-icons">delete</span>
            </InteractableDiv>
        </div>
    {/each}
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