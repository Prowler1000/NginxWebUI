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

    $effect(() => {
        for (const key of header_keys) {
            const elems = document.getElementsByClassName(`${key}-column`);
            const header_title = document.getElementById(`header-${key}`);
            const header_width = header_sizes[key];
            if (elems.length > 0 && header_title !== null) {
                const first = elems[0] as HTMLElement;
                const value_width = first.clientWidth;
                const header_width = header_title.clientWidth;
                console.log(header_width);
            }
        }
    });

</script>

<div class="content">
    <div class="table">
        <div class="header">
            {#each header_keys as key}
                <div id={`header-${key}`} class="column-name">
                    {key_label_map[key]}
                </div>
            {/each}
        </div>
        <div class="body">
            {#each data_map as row}
                <div class="row">
                    {#each header_keys as key}
                        <div class={`column-value ${typeof row.data[key]}-column ${key}-column`} style:min-width={`${header_sizes[key]}px`}>
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
            {/each}
        </div>
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
        flex-direction: column;
        align-items: center;
    }

    .header {
        display: flex;
        flex-direction: row;
        max-width: var(--table-width);
        background-color: cyan;
        width: 80%;
    }

    .column-name {
        text-align: center;
    }

    .body {
        max-width: var(--table-width);
        width: 100%;
    }

    .row {
        display: flex;
        width: 100%;
    }

    .column-value {
        margin: auto;
    }

    .column-input {
        margin: auto;
    }
    .string-column {
        flex-grow: 3;
        display: flex;
    }
    .number-column {
        flex-grow: 2;
    }
    .boolean-column {
        flex-grow: 1;
        margin: 0 5%;
    }
    .input-text {

    }
    .input-number {
        width: 4em;
        text-align: center;
    }
    .input-boolean {

    }


    .btn-ctr {
        margin: auto;
        display: flex;
        flex-grow: 1;
    }

    .btn-ctr * {
        margin: auto;
    }

</style>