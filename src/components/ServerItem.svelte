<script lang="ts">
	import InteractableDiv from "$lib/accessibility/InteractableDiv.svelte";
	import { CreateProxyServer, CreateServer, DeleteProxyServer, DeleteServer, UpdateProxyServer, UpdateServer } from "$lib/api";
	import type { Auth, ProxyServer, Server, SSLConfig } from "@prisma/client";
	import { onMount } from "svelte";

    type Props = {
        id: number,
        enabled: boolean,
        name: string,
        hostname: string,
        http_port: number,
        ssl_port: number,
        use_ssl: boolean,
        authId: number | null,
        ssl_config_id: number | null,

        scheme: "HTTP" | "HTTPS",
        forward_server: string,
        forward_port: number,

        server_id: number,
        auths: Auth[],
        SSLConfigs: SSLConfig[],

        save_callback?: () => void,
        delete_callback?:() => void,
    }
    let {
        id = $bindable(),
        enabled = $bindable(),
        name = $bindable(),
        hostname = $bindable(),
        http_port = $bindable(),
        ssl_port = $bindable(),
        use_ssl = $bindable(),
        ssl_config_id = $bindable(),

        scheme = $bindable(),
        forward_server = $bindable(),
        forward_port = $bindable(),

        auths,
        SSLConfigs,
        authId = $bindable(),

        server_id = $bindable(),
        save_callback,
        delete_callback,
    }: Props = $props();

    let saved_server: Server;
    let saved_proxy: ProxyServer;

    let canSave = $state(false);
    let showDetails = $state(true);
    let can_delete = $derived(id !== 0);
    let confirm_delete = $state(false);

    onMount(() => {
        saved_server = {
            id: server_id,
            enable: enabled,
            name: name,
            hostname: hostname,
            http_port: http_port,
            ssl_port: ssl_port,
            use_ssl: use_ssl,
            authId: authId,
            sSLConfigId: ssl_config_id,
        }
        saved_proxy = {
            id: id,
            forward_scheme: scheme,
            forward_server: forward_server,
            forward_port: forward_port,
            serverId: server_id,
        }
    })

    let timer: NodeJS.Timeout | undefined = undefined;
    function server_has_changes(): boolean {
        return !(
            saved_server.name === name &&
            saved_server.enable === enabled &&
            saved_server.hostname === hostname &&
            saved_server.http_port === http_port &&
            saved_server.ssl_port === ssl_port &&
            saved_server.use_ssl === use_ssl &&
            saved_server.authId === authId &&
            saved_server.sSLConfigId === ssl_config_id
        )
    }
    function proxy_has_changes(): boolean {
        return !(
            saved_proxy.forward_scheme === scheme &&
            saved_proxy.forward_server === forward_server &&
            saved_proxy.forward_port === forward_port
        )
    }

    function setCanSave() {
        canSave = server_has_changes() || proxy_has_changes();
    }

    function checkCanSave(timeout_dur = 500) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(setCanSave, timeout_dur)
    }

    function create_server_object(): Server {
        return {
            id: server_id,
            enable: enabled,
            name: name,
            hostname: hostname,
            http_port: http_port,
            ssl_port: ssl_port,
            use_ssl: use_ssl,
            authId: authId,
            sSLConfigId: ssl_config_id,
        }
    }

    function create_proxy_server_object(): ProxyServer {
        return {
            id: id,
            forward_scheme: scheme,
            forward_server: forward_server,
            forward_port: forward_port,
            serverId: server_id,
        }
    }

    async function save() {
        if (server_has_changes()) {
            const serverObj = create_server_object();
            let new_server: Server | null;
            if (server_id === 0) {
                new_server = await CreateServer(serverObj);
            }
            else {
                new_server = await UpdateServer(serverObj);
            }
            if (new_server !== null) {
                server_id = new_server.id;
                saved_server = new_server;
            }
        }
        if (proxy_has_changes()) {
            const proxyObj = create_proxy_server_object();
            let new_server: ProxyServer | null;
            if (id === 0) {
                new_server = await CreateProxyServer(proxyObj);
            }
            else {
                new_server = await UpdateProxyServer(proxyObj);
            }
            if (new_server !== null) {
                id = new_server.id;
                saved_proxy = new_server;
            }
            else if (id === 0) {
                await DeleteServer(server_id);
            }
        }
        setCanSave();
        if (save_callback) save_callback();
    }

    async function del() {
        if (!confirm_delete) {
            return // Don't continue if the confirmation elements aren't visible
        }
        const deleted_proxy = await DeleteProxyServer(id);
        if (deleted_proxy) {
            const deleted_server = await DeleteServer(server_id);
            if (deleted_server) {
                confirm_delete = false;
                if (delete_callback) delete_callback();
            }
        }
    }

    function onAuthSelectChange(e: Event & {
        currentTarget: EventTarget & HTMLSelectElement;
    }) {
        const id = Number(e.currentTarget.value);
        if (id === -1) {
            authId = null
        }
        else {
            authId = id;
        }
        checkCanSave();
    }

    function onSSLSelectChange(e: Event & {
        currentTarget: EventTarget & HTMLSelectElement;
    }) {
        const id = Number(e.currentTarget.value);
        if (id === -1) {
            ssl_config_id = null
        }
        else {
            ssl_config_id = id;
        }
        checkCanSave();
    }

    function toggleShowDetails() {
        showDetails = !showDetails;
    }

    function deleteToggle() {
        confirm_delete = !confirm_delete;
    }
</script>

<div class="ctr">
    <div class="primary-ctr">
        <div class="id">
            {id}
        </div>
        <div class="name">
            <input id="name" type="text" bind:value={name} oninput={() => checkCanSave()}/>
        </div>
        <div class="hostname">
            <input id="hostname" type="text" bind:value={hostname} oninput={() => checkCanSave()}/>
        </div>
        <div class="port">
            <input id="http_port" type="number" bind:value={http_port} oninput={() => checkCanSave()}/>
        </div>
        <div class="port">
            <input id="ssl_port" type="number" bind:value={ssl_port} oninput={() => checkCanSave()}/>
        </div>

        <InteractableDiv class={`show-details ${showDetails ? 'rot-90' : ''}`} oninteract={toggleShowDetails}>
            <span class="material-icons">chevron_right</span>
        </InteractableDiv>

        <InteractableDiv class={`save-btn ${canSave ? '' : 'grayed-out'}`} oninteract={save}>
            <span class="material-icons">save</span>
        </InteractableDiv>

        <div class="delete-ctr">
            {#if can_delete}
                <InteractableDiv class={`delete-btn ${confirm_delete ? 'invisible' : ''}`} oninteract={deleteToggle}>
                    <span class="material-icons">delete</span>
                </InteractableDiv>
                <InteractableDiv class={`delete-cancel ${confirm_delete ? '' : 'invisible'}`} oninteract={deleteToggle}>
                    <span class="material-icons">close</span>
                </InteractableDiv>
                <InteractableDiv class={`delete-confirm ${confirm_delete ? '' : 'invisible'}`} oninteract={del}>
                    <span class="material-icons">check</span>
                </InteractableDiv>
            {/if}
        </div>
    </div>
    {#if showDetails}
        <div class="details-ctr">
            <div class="general-settings-ctr">
                <div class="auth-settings-ctr settings-ctr">
                    <div class="auth-settings-title">
                        Auth Settings:
                    </div>
                    <div class="auth-settings-select">
                        <select onchange={onAuthSelectChange}>
                            <option value={-1} selected={authId === null}>Disabled</option>
                            {#each auths as auth}
                            <option value={auth.id} selected={authId === auth.id}>{auth.name}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="ssl-settings-ctr settings-ctr">
                    <div class="ssl-settings-title">
                        SSL Settings:
                    </div>
                    <div class="ssl-settings-select">
                        <select onchange={onSSLSelectChange}>
                            <option value={-1} selected={ssl_config_id === null}>Default</option>
                            {#each SSLConfigs as config}
                            <option value={config.id} selected={ssl_config_id === config.id}>{config.name}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
            <div class="proxy-settings-ctr">
                <div class="proxy-settings-title">
                    Proxy Settings:
                </div>
                <div class="proxy-settings-inputs">
                    <div class="proxy-setting">
                        <label for="scheme">Forward Scheme:</label>
                        <select id="scheme" bind:value={scheme} onchange={() => checkCanSave()}>
                            <option value="HTTP">HTTP</option>
                            <option value="HTTPS">HTTPS</option>
                        </select>
                    </div>
                    <div class="proxy-setting">
                        <label for="fwd_server_input">Forward Server:</label>
                        <div class="input-ctr"> <input id="fwd_server_input" type="text" bind:value={forward_server} oninput={() => checkCanSave()}/> </div>
                    </div>
                    <div class="proxy-setting">
                        <label for="fwd_port_input">Forward Port:</label>
                        <div class="input-ctr"> <input id="fwd_port_input" type="number" bind:value={forward_port} oninput={() => checkCanSave()}/> </div>
                    </div>
                </div>
                
            </div>
        </div>
    {/if}
</div>

<style>
    .primary-ctr {
        display: flex;
        width: 100%;
        margin: 10px;
        justify-content: center;
    }
    .primary-ctr * {
        margin-left: 5px;
    }
    .id {
        width: 1%;
    }
    .name {
        width: 10%;
    }
    .hostname {
        width: 10%;
    }
    .port {
        width: 5%;
    }
    .port input {
        width: 95%;
    }
    :global(.show-details) {
        animation: rotate0 0.05s linear forwards;
    }
    :global(.rot-90) {
        animation: rotate90 0.05s linear forwards;
    }
    :global(.save-btn) {
        margin-left: 5px;
        padding: 0;
    }
    :global(.grayed-out)  {
        filter: contrast(0);
    }

    .delete-ctr {
        width: 10%;
        display: flex;
    }
    :global(.invisible) {
        display: none;
    }

    .general-settings-ctr {
        display: flex;
        justify-content: center;
    }

    .settings-ctr {
        margin: 0 10px 10px 10px;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .settings-ctr * {
        margin: auto;
    }

    .auth-settings-ctr {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .auth-settings-ctr *{
        margin: auto;
    }

    .proxy-settings-ctr {
        margin: 0;
        display: flex;
        width: 100%;
        justify-content: center;
        flex-direction: column;
    }
    .proxy-settings-title {
        margin: auto;
    }
    .proxy-settings-inputs {
        margin: auto;
        width: 100%;
    }
    .proxy-setting {
        display: flex;
        margin: 5px;
    }
    .proxy-setting label {
        width: 50%;
        text-align: right;
    }

    @keyframes rotate90 {
        0% {
            transform: translateY(0%) rotate(0deg);
        }
        100% {
            transform: translateY(-15%) rotate(90deg);
        }
    }
    @keyframes rotate0 {
        100% {
            transform: translateY(0%) rotate(0deg);
        }
        0% {
            transform: translateY(-15%) rotate(90deg);
        }
    }
</style>
