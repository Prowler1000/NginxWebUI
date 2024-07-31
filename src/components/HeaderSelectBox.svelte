<script lang="ts">
	import { GetInteractType, InteractType } from "$lib/accessibility";
	import type { Header } from "@prisma/client";

    type Props = {
        headers: Header[],
        toggleCallback: (id: number) => void,
    }
    const {
        headers,
        toggleCallback
    }: Props = $props();

    let selectedHeaders = $state([] as number[])

    const onRowClick = (e: MouseEvent & {
    currentTarget: EventTarget & HTMLTableRowElement;
}, id: number) => {
    onRowInteract(GetInteractType(e), id);
}

    const onRowKeyboard = (e: KeyboardEvent & {
    currentTarget: EventTarget & HTMLTableRowElement;
}, id: number) => {
    onRowInteract(GetInteractType(e), id);
}

    function onRowInteract(interactType: InteractType, id: number)  {
        if (interactType === InteractType.BASIC) {
            const deselect = selectedHeaders.length === 1 && selectedHeaders[0] === id;
            selectedHeaders.splice(0, selectedHeaders.length);
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
                    // If ID < first id, select from ID to first id.
                    // Otherwise, select from last id to ID.
                    const start = id < selectedHeaders[0] ? id : selectedHeaders[selectedHeaders.length - 1];
                    const end = id < selectedHeaders[0] ? selectedHeaders[0] : id;
                    // I'm lazy and don't wanna select a range of existing headers.
                    // Will backfire as databases grow/get old
                    for (let i = start; i < end+1; i++) {
                        selectedHeaders.push(i);
                    }
                }
            }
        }
        else if (interactType === InteractType.ESCAPE) {
            selectedHeaders.splice(0, selectedHeaders.length);
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
                    <tr tabindex="0" onclick={(e) => onRowClick(e, header.id)} onkeypress={(e) => onRowKeyboard(e, header.id)}>
                        <td class={`${selectedHeaders.includes(header.id) ? 'selectedRow' : ''}`}>{header.id}</td>
                        <td class={`${selectedHeaders.includes(header.id) ? 'selectedRow' : ''}`}>{header.name}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .content {
        border: rgb(83, 83, 83) solid 1px;
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
    .select-table tbody tr:hover td {
        background-color: var(--select-color);
    }
    .selectedRow {
        background-color: var(--select-color);
    }
</style>