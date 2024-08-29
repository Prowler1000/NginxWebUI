<script lang="ts">
	import { onMount } from 'svelte';

    const {
        data
    } = $props();

    const CAN_SAVE_DELAY = 500;

    let auths = $state(data.auths);
    let can_save = $state({} as {[id: number]: boolean});

    onMount(() => {
        for (const auth of auths) {
            if (!(auth.id in can_save)) {
                can_save[auth.id] = false;
            }
        }
    });

    function updateCanSave(id: number) {
        
    }

    function checkCanSave(id: number) {
        const timers: {[id: number]: NodeJS.Timeout } = {}
        if (id in timers) {
            clearTimeout(timers[id]);
        }
        timers[id] = setTimeout(() => {
            updateCanSave(id);
        }, CAN_SAVE_DELAY);
    }

    function save_request_header(index: number, value: string) {
        auths[index].auth_request_headers.push(value);
    }

    function on_request_header_submit(index: number, e: SubmitEvent & {currentTarget: EventTarget & HTMLInputElement; }) {
        save_request_header(index, e.currentTarget.value);
        e.currentTarget.value = "";
    }



</script>

<div class="content">
    <div class="auths-ctr">
        {#each auths as auth, index}
            <div class="auth-ctr">
                <div class="auth-id">
                    {auth.id}
                </div>
                <div class="input-ctr">
                    <label for="request-input">Auth Request:</label>
                    <input id="request-input" type="text" bind:value={auth.auth_request} oninput={() => checkCanSave(auth.id)}/>
                </div>
                <div class="headers-ctr">
                    <div class="input-ctr">
                        <label for="request-headers-input">Request Headers:</label>
                        <input id="request-headers-input" type="text" onsubmit={(e) => on_request_header_submit(index, e)}/>
                    </div>
                    {#each auth.auth_request_headers as header}
                        <div class="idk-tbh">{header}</div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
.auths-ctr {

}

.auth-ctr {
    display: flex;
}
.input-ctr {
    display: flex;
}
</style>