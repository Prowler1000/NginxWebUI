<script lang="ts">
	import InteractableDiv from "$lib/accessibility/InteractableDiv.svelte";
	import { type Header } from "@prisma/client";
	import HeaderSelectBox from "./HeaderSelectBox.svelte";

    type Props = {
        id: number,
        name: string,
        hostname: string,
        http_port: number,
        ssl_port: number,
        enabled_headers: Header[],
        all_headers: Header[]
    }
    let {
        id,
        name,
        hostname,
        http_port,
        ssl_port,
        enabled_headers,
        all_headers
    }: Props = $props();

    let modifiedProps: Props;

    let canSave = $state(false);
    let showDetails = $state(true);

    $effect(() => {
        modifiedProps = {
            id,
            name,
            hostname,
            http_port,
            ssl_port,
            enabled_headers,
            all_headers
        }
    })

    let timer: NodeJS.Timeout | undefined = undefined;
    const setCanSave = () => {
        canSave = !(
            modifiedProps.name === name &&
            modifiedProps.hostname === hostname &&
            modifiedProps.http_port === http_port &&
            modifiedProps.ssl_port === ssl_port
        )
    }
    function checkCanSave(timeout_dur = 500) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(setCanSave, timeout_dur)
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
    <div class="header-ctr">
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
            <HeaderSelectBox headers={all_headers} toggleCallback={() => {}}/>
        </div>
    {/if}
</div>

<style>
    .header-ctr {
        display: flex;
        width: 100%;
        margin: 10px;
        justify-content: center;
    }
    .header-ctr * {
        margin-left: 5px;
    }
    .details-ctr {
        display: flex;
        width: 100%;
        justify-content: center;
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
</style>
