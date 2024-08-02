<script lang="ts">
	import { GetInteractType, InteractType } from "$lib/accessibility";
	import type { Header } from "@prisma/client";
	import InteractHandler from "./InteractHandler.svelte";

    type Props = {
        headers: Header[],
        onQuickToggle: (id: number) => void,
        selectedHeaders: number[]
    }
    const {
        headers,
        selectedHeaders = $bindable([] as number[]),
        onQuickToggle
    }: Props = $props();

    function clearSelectedHeaders() {
        selectedHeaders.splice(0, selectedHeaders.length);
    }

    const createInteractCallback = (id: number) => {
        return (iType: InteractType) => onRowInteract(iType, id);
    }

    function onRowInteract(interactType: InteractType, id: number)  {
        if (interactType === InteractType.BASIC) {
            const deselect = selectedHeaders.length === 1 && selectedHeaders[0] === id;
            clearSelectedHeaders();
            if (!deselect) {
                selectedHeaders.push(id);
            }
        }
        else if (interactType === InteractType.MULTISELECT) {
            const index = selectedHeaders.findIndex(x => x === id);
            if (index > -1) {
                selectedHeaders.splice(index, 1);
            }
            else {
                selectedHeaders.push(id);
            }
        }
        else if (interactType === InteractType.RANGESELECT) {
            if (selectedHeaders.length === 0) {
                onRowInteract(InteractType.BASIC, id);
            }
            else {
                selectedHeaders.sort();
                // If the interacted row is already selected, just treat it as a multiselect
                if (selectedHeaders[0] <= id && selectedHeaders[selectedHeaders.length-1] >= id) {
                    onRowInteract(InteractType.MULTISELECT, id);
                }
                else {
                    let min = Math.min(id, selectedHeaders[0]);
                    let max = Math.max(id, selectedHeaders[selectedHeaders.length-1]);
                    clearSelectedHeaders();
                    for (const header of headers) {
                        if (header.id >= min && header.id <= max) {
                            selectedHeaders.push(header.id);
                        }
                    }
                }
            }
        }
        else if (interactType === InteractType.ESCAPE) {
            selectedHeaders.splice(0, selectedHeaders.length);
        }

        // Inform parent of change every click except for double click
        if (interactType === InteractType.DOUBLE) {
            clearSelectedHeaders();
            onQuickToggle(id);
        }
    }

</script>

<div class="ctr">
    <div class="content">
        <table class="select-table">
            <tbody>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
                {#each headers as header}
                    <InteractHandler oninteract={createInteractCallback(header.id)} type="tr">
                        <td class={`${selectedHeaders.includes(header.id) ? 'selectedRow' : ''}`}>{header.id}</td>
                        <td class={`${selectedHeaders.includes(header.id) ? 'selectedRow' : ''}`}>{header.name}</td>
                    </InteractHandler>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .content {
        border: rgb(83, 83, 83) solid 1px;
        min-width: 200px;
    }
    td {
        user-select: none;
        margin: 0;
        padding: 0;
    }
    .select-table {
        text-align: left;
        border-collapse: collapse;
    }
    :global(tr:hover) td {
        background-color: var(--select-color);
    }
    .selectedRow {
        background-color: var(--select-color);
    }
</style>