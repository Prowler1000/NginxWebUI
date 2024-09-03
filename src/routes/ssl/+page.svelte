<script lang="ts">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
	import { CreateSSLConfig, DeleteSSLConfig, UpdateSSLConfig } from '$lib/api.js';
    import type { SSLConfig } from '@prisma/client';

    const {
        data
    } = $props();

    let saved_ssl_configs = $state(data.SSLConfigs.map(x => x));
    let ssl_configs = $state(data.SSLConfigs);
    let can_save = $state([] as boolean[]);

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
        if (!ssl_configs.some(x => x.id === 0)) {
            ssl_configs.push(structuredClone(new_ssl_config));
            saved_ssl_configs.push(structuredClone(new_ssl_config));
            can_save.push(false)
        }
    }
    function set_can_save(index: number) {
        const save = !Object.keys(ssl_configs[index]).every(key => {
            return ssl_configs[index][key as keyof SSLConfig] === saved_ssl_configs[index][key as keyof SSLConfig] || key === 'protocols'
        });
        can_save[index] = save
    }

    let timeouts: {[key: number]: NodeJS.Timeout} = {}
    function check_can_save(index: number) {
        if (index in timeouts) {
            clearTimeout(timeouts[index])
        }
        timeouts[index] = setTimeout(() => {
            set_can_save(index);
        }, 500);
    }

    async function save(index: number) {
        if (ssl_configs[index].id === 0) {
            const res = await CreateSSLConfig(ssl_configs[index]);
            if (res !== null) {
                ssl_configs[index] = res;
                saved_ssl_configs[index] = structuredClone(res);
            }
        }
        else {
            const res = await UpdateSSLConfig(ssl_configs[index]);
            if (res !== null) {
                ssl_configs[index] = res;
                saved_ssl_configs[index] = structuredClone(res);
            }
        }
    }

    async function del(index: number) {
        if (ssl_configs[index].id !== 0) {
            await DeleteSSLConfig(ssl_configs[index].id);
        }
        ssl_configs = ssl_configs.filter(x => x.id !== ssl_configs[index].id);
        saved_ssl_configs = saved_ssl_configs.filter(x => x.id != saved_ssl_configs[index].id);
    }

</script>

<div class="page-ctr">
    {#each ssl_configs as config, index}
        <div class="primary-ctr">
            <div class="value-ctr id-ctr input-ctr">
                <div>ID:</div> 
                <div>{config.id}</div>
            </div>
            <div class="input-ctr name-ctr">
                <label for="name-input">Name:</label>
                <input id="name-input" type="text" bind:value={config.name} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr cert-ctr">
                <label for="cert-input">Certificate Location:</label>
                <input id="cert-input" type="text" bind:value={config.cert_location} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr key-ctr">
                <label for="key-input">Key Location:</label>
                <input id="key-input" type="text" bind:value={config.cert_key_location} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr timeout-ctr">
                <label for="timeout-input">Session Timeout:</label>
                <input id="timeout-input" type="text" bind:value={config.session_timeout} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr cache-ctr">
                <label for="cache-input">Session Cache:</label>
                <input id="cache-input" type="text" bind:value={config.session_cache} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr tickets-ctr">
                <label for="tickets-input">Session Tickets</label>
                <input id="tickets-input" type="checkbox" bind:checked={config.session_tickets} oninput={() => check_can_save(index)}/>
            </div>
            <!-- Missing Protocols input, MUST be added, even if it's just a list and checkboxes -->
            <div class="input-ctr ciphers-ctr">
                <label for="ciphers-input">Prefer Server Ciphers:</label>
                <input id="ciphers-input" type="checkbox" bind:checked={config.prefer_server_ciphers} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr stapling-ctr">
                <label for="stapling-input">SSL Stapling:</label>
                <input id="stapling-input" type="checkbox" bind:checked={config.stapling} oninput={() => check_can_save(index)}/>
            </div>
            <div class="input-ctr staple-verify-ctr">
                <label for="verify-input">Verify SSL Stapling:</label>
                <input id="verify-input" type="checkbox" bind:checked={config.stapling_verify} oninput={() => check_can_save(index)}/>
            </div>
            <div class="control-ctr">
                <InteractableDiv oninteract={() => {save(index)}} class={can_save[index] ? '' : 'grayed-out'}>
                    <span class="material-icons">save</span>
                </InteractableDiv>
                <InteractableDiv oninteract={() => {del(index)}}>
                    <span class="material-icons">delete</span>
                </InteractableDiv>
            </div>
        </div>
    {/each}
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