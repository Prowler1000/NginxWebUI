<script lang="ts">
	import InteractableDiv from "$lib/accessibility/InteractableDiv.svelte";
	import { type Header } from "@prisma/client";
	import HeaderSelectBox from "./HeaderSelectBox.svelte";
	import InteractHandler from "./InteractHandler.svelte";

    type Props = {
        id: number,
        name: string,
        hostname: string,
        http_port: number,
        ssl_port: number,
        enabled_headers: Header[],
        all_headers: Header[]
    }
    const {
        id,
        name,
        hostname,
        http_port,
        ssl_port,
        enabled_headers,
        all_headers
    }: Props = $props();

    let mod_name = $state(name);
    let mod_hostname = $state(hostname);
    let mod_http_port = $state(http_port);
    let mod_ssl_port = $state(ssl_port);

    // Whether a header is enabled or disabled
    let headersStatus: Record<number, boolean> = $state(Object.assign({}, ...all_headers.map(header => {
        return {
            [header.id]: enabled_headers.some(x => x.id === header.id)
        };
    })));
    
    let mod_enabled_headers = $derived(all_headers.filter(header => headersStatus[header.id]));
    let mod_disabled_headers = $derived(all_headers.filter(header => !headersStatus[header.id]));

    let disabledHeadersSelected: number[] = $state([]);
    let enabledHeadersSelected: number[] = $state([]);

    let canSave = $state(false);
    let showDetails = $state(true);

    function headerQuickEnable(id: number) {
        headersStatus[id] = true;
        checkCanSave();
    }
    function headerQuickDisable(id: number) {
        headersStatus[id] = false;
        checkCanSave();
    }

    function headers_equal(a: Header[], b: Header[]): boolean {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        return true && 
            a.every(x => b.some(y => y.id === x.id)) &&
            b.every(x => a.some(y => y.id === x.id))
    }

    let timer: NodeJS.Timeout | undefined = undefined;
    function setCanSave() {
        canSave = !(
            mod_name === name &&
            mod_hostname === hostname &&
            mod_http_port === http_port &&
            mod_ssl_port === ssl_port &&
            headers_equal($state.snapshot(mod_enabled_headers), enabled_headers)
        )
    }
    function checkCanSave(timeout_dur = 500) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(setCanSave, timeout_dur)
    }

    function enable_selected() {
        for (const id of disabledHeadersSelected) {
            headersStatus[id] = true;
        }
        if (disabledHeadersSelected.length > 0) {
            enabledHeadersSelected = disabledHeadersSelected.map(x => x);
            disabledHeadersSelected = [];
            checkCanSave();
        }
    }

    function disable_selected() {
        for (const id of enabledHeadersSelected) {
            headersStatus[id] = false;
        }
        if (enabledHeadersSelected.length > 0) {
            disabledHeadersSelected = enabledHeadersSelected.map(x => x);
            enabledHeadersSelected = [];
            checkCanSave();
        }
    }

    function onfieldinput(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
        switch (e.currentTarget.id) {
            case "name":
                modifiedProps.name = e.currentTarget.value;
                break;
            case "hostname":
                modifiedProps.hostname = e.currentTarget.value;
                break;
            case "http_port":
                modifiedProps.http_port = Number(e.currentTarget.value);
                break;
            case "ssl_port":
                modifiedProps.ssl_port = Number(e.currentTarget.value);
                break;
            default:
                break;
        }
        checkCanSave();
    }

    function save() {

    }

    function toggleShowDetails() {
        showDetails = !showDetails;
    }
</script>

<div class="ctr">
    <div class="primary-ctr">
        <div class="id">
            {id}
        </div>
        <div class="name">
            <input id="name" type="text" value={name} oninput={onfieldinput}/>
        </div>
        <div class="hostname">
            <input id="hostname" type="text" value={hostname} oninput={onfieldinput}/>
        </div>
        <div class="port">
            <input id="http_port" type="number" value={http_port} oninput={onfieldinput}/>
        </div>
        <div class="port">
            <input id="ssl_port" type="number" value={ssl_port} oninput={onfieldinput}/>
        </div>

        <InteractableDiv class={`show-details ${showDetails ? 'rot-90' : ''}`} oninteract={toggleShowDetails}>
            <span class="material-icons">chevron_right</span>
        </InteractableDiv>

        <InteractableDiv class={`save-btn ${canSave ? '' : 'grayed-out'}`} oninteract={save}>
            <span class="material-icons">save</span>
        </InteractableDiv>
    </div>
    {#if showDetails}
        <div class="details-ctr">
            <div class="headers-ctr">
                <HeaderSelectBox 
                    headers={mod_disabled_headers} 
                    bind:selectedHeaders={disabledHeadersSelected}
                    onQuickToggle={headerQuickEnable}>
                </HeaderSelectBox>
                <div class="btn-ctr">
                    <InteractHandler oninteract={enable_selected} type="div" class="interact-handler">
                        <span class="material-icons">keyboard_double_arrow_right</span>
                    </InteractHandler>
                    <InteractHandler oninteract={disable_selected} type="div" class="interact-handler">
                        <span class="material-icons">keyboard_double_arrow_left</span>
                    </InteractHandler>
                </div>
                <HeaderSelectBox 
                    headers={mod_enabled_headers} 
                    bind:selectedHeaders={enabledHeadersSelected}
                    onQuickToggle={headerQuickDisable}>
                </HeaderSelectBox>
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

    .details-ctr {
        margin: 0;
        padding: 10px;
        display: flex;
        width: 100%;
        justify-content: left;
    }
    .headers-ctr {
        display: flex;
    }
    .headers-ctr .btn-ctr {
        padding: 0 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    :global(.headers-ctr .btn-ctr .interact-handler) {
        outline: solid black 1px;
        margin: auto;
        padding: 0;
        display: flex;
    }
</style>
