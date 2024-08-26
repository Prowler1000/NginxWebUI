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


</script>

<div class="content">
    <div class="auths-ctr">
        {#each auths as auth}
            <div class="auth-ctr">
                <div class="auth-id">
                    {auth.id}
                </div>
                <div class="auth-request-ctr">
                    <input type="text" bind:value={auth.auth_request} oninput={() => checkCanSave(auth.id)}/>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>

</style>