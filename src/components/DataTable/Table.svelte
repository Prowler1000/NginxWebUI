<script lang="ts" generics="T extends {[key: string]: unknown}">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
	import { onMount } from 'svelte';

    type Type = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";

    type Props = {
        data: T[],
        key_label_map: {[K in keyof Partial<T>]: string},
        header_keys: string[],
    };
    const {
        data,
        key_label_map,
        header_keys,
    }: Props = $props();

    let data_map = $state([] as {data: T, saved_data: T}[]);
    let header_sizes = $state({} as {[key: string]: number})

    onMount(() => {
        data_map = data.map(x => {
            return {data: x, saved_data: structuredClone(x)}
        });
        header_keys.forEach(key => {
            const title = document.getElementById(`header-${key}`);
            if (title != null) {
                header_sizes[key] = title.clientWidth;
            }
        })
    })

</script>

<div class="content">
    <div class="table">
        {#each header_keys as key}
            <div class="column">
                <div class="column-header">
                    {key_label_map[key]}
                </div>
                <div class="column-values">
                    {#each data_map as row}
                        <div class="value">
                            {#if typeof row.data[key] === 'string'}
                            <input type="text" class="column-input input-text" bind:value={row.data[key]} />
                            {:else if typeof row.data[key] === 'number'}
                            <input type="numeric" class="column-input input-number" bind:value={row.data[key]} />
                            {:else if typeof row.data[key] === 'boolean'}
                            <input type="checkbox" class="column-input input-boolean" bind:checked={row.data[key]} />
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <!--
    <div class="btn-ctr">
        <InteractableDiv class="save-icon row-btn" oninteract={() => {}}>
            <span class="material-icons">chevron_right</span>
        </InteractableDiv>
        <InteractableDiv class="save-icon row-btn" oninteract={() => {}}>
            <span class="material-icons">save</span>
        </InteractableDiv>
        <InteractableDiv class="save-icon row-btn" oninteract={() => {}}>
            <span class="material-icons">delete</span>
        </InteractableDiv>
    </div>
    -->

</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 15px;

        --table-width: 60%;
    }

    .table {
        display: flex;
        flex-direction: row;
        align-content: center;
        justify-content: center;
    }

    .value {
        min-height: 25px;
        display: flex;
        padding: 3px 0.5em;
    }

    .column {
        display: flex;
        flex-direction: column;
        text-align: center;
        margin: 0 3px;
    }

    .column-input {
        margin: auto;
    }
    .input-number {
        width: 4em;
        text-align: center;
    }

</style>