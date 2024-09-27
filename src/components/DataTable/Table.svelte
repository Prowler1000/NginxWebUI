<script lang="ts" generics="T extends {[key: string]: any}">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
	import {  onMount, type Snippet } from 'svelte';

    type Props = {
        data: T[],
        key_label_map: {[K in keyof Partial<T>]: string},
        display_value_keys?: string[],
        header_keys: string[],
        details?: Snippet<[T, (key: keyof T, data: T[keyof T]) => void]>
        save_callback: (data: T) => Promise<T | undefined>,
        delete_callback: (data: T) => Promise<boolean>,
    };
    const {
        data,
        key_label_map,
        display_value_keys = [],
        header_keys,
        details,
        save_callback,
        delete_callback,
    }: Props = $props();

    type Row = {
        data: T, 
        saved_data: T | undefined, 
        show_details: boolean,
    }

    let combined_keys = [...display_value_keys, ...header_keys]

    let data_map = $state([] as Row[]);
    let can_save = $derived(data_map.map(x => check_can_save(x)))
    let header_sizes = $state({} as {[key: string]: number});
    let rows_mounted = $state(0);
    let sort_status = $state(Object.fromEntries(combined_keys.map((v, i) => {
        return [v, 0]
    })));

    let loaded = $state(false);

    export function add_value(data: T) {
        if (data_map.some(x => x.saved_data !== undefined)) {
            data_map.push({
                data: data,
                saved_data: undefined,
                show_details: true,
            });
        }

    }

    onMount(() => {
        data_map = data.map(x => {
            return {
                data: x, saved_data: structuredClone(x), 
                show_details: false
            }
        });
        //data_map = [];
        combined_keys.forEach(key => {
            const title = document.getElementById(`header-${key}`);
            if (title != null) {
                const size = title.getBoundingClientRect().width;
                header_sizes[key] = size;
            }
        });
    });

    function post_load() {
        sort_status[display_value_keys[0] ?? header_keys[0]] = 1;
        sort();
        combined_keys.forEach(key => {
            const header = document.getElementById(`header-${key}`);
            const rows = document.getElementsByClassName('row');
            if (rows.length > 0 && header !== null) {
                const first = rows[0];
                const value = first.getElementsByClassName(`${key}-value`)[0];
                const value_coords = value.getBoundingClientRect();
                const mid_point = value_coords.left + value_coords.width / 2;

                const header_coords = header.getBoundingClientRect();
                let header_width = header_coords.width;
                const sort_arrow = header.getElementsByClassName("sort-arrow");
                if (sort_arrow.length > 0) {
                    header_width -= sort_arrow[0].getBoundingClientRect().width;
                }
                let header_mid = header_coords.left + header_width / 2;
                header.style.left = `${mid_point - header_mid}px`;
            }
        });

        loaded = true;
    }

    function sort_data(orderKey: keyof T, order = 1) {
        data_map.sort((a, b) => {
            if (a.data[orderKey] < b.data[orderKey]) {
                return (order) * -1;
            }
            if (a.data[orderKey] > b.data[orderKey]) {
                return (order) * 1;
            }
            return 0;
        })
    }

    function sort() {
        const sort_keys = Object.keys(sort_status).filter(x => sort_status[x] != 0);
        if (sort_keys.length > 1 || sort_keys.length < 0) {
            // Throw some type of error maybe?
        }
        else {
            sort_data(sort_keys[0], sort_status[sort_keys[0]]);
        }
    }

    function toggle_sort(key: keyof typeof sort_status) {
        let default_sort: keyof typeof sort_status | undefined = undefined;
        for (const loop_key in sort_status) {
            if (loop_key === key) {
                switch (sort_status[key]) {
                    case 0:
                        sort_status[key] = 1;
                        break;
                    case 1:
                        sort_status[key] = -1;
                        break;
                    case -1:
                        sort_status[key] = 0;
                        default_sort = display_value_keys[0] ?? header_keys[0];
                        break;
                }
            }
            else {
                sort_status[loop_key] = 0;
            }
        }
        if (default_sort !== undefined) {
            sort_status[default_sort] = 1;
        }
        sort();
    }

    function onLoad(el: HTMLDivElement) {
        rows_mounted++;
        if (!loaded) {
            post_load();
        }
    }

    function check_can_save(row: Row) {
        return Object.keys(row.data).some(key => 
            row.data[key] !== row.saved_data?.[key]
        )
    }

    async function save(index: number) {
        const entry = data_map[index];
        const new_data = await save_callback(entry.data);
        if (new_data !== undefined) {
            entry.data = structuredClone(new_data);
            entry.saved_data = structuredClone(new_data);
        }
    }

    async function del(index: number) {
        const entry = data_map[index];
        if (entry.saved_data !== undefined) {
            if (!(await delete_callback(entry.saved_data))) {
                // Throw some type of error? Who knows
                return;
            }
        }
        data_map.splice(index, 1);
    }

</script>

<div class="content">
    <div class="table">
        <div class="header">
            {#each combined_keys as key}
                <InteractableDiv oninteract={() => toggle_sort(key)}>
                    <div id={`header-${key}`} class="column-header">
                        {key_label_map[key]}
                        <span class="material-icons sort-arrow" style:opacity={sort_status[key] === 0 ? "0" : "1"}>
                            {#if sort_status[key] === 1}
                                keyboard_arrow_down
                            {:else}
                                keyboard_arrow_up
                            {/if}
                        </span>
                    </div>
                </InteractableDiv>
            {/each}
        </div>
        <div id="body" class="body">
            {#each data_map as row, index} 
                <div class="row" use:onLoad>
                    <div class="values">            
                        {#each display_value_keys as key}
                            <div class={`value ${key}-value display-value`} 
                                style:min-width={key in header_sizes ? `${header_sizes[key] + 10}px` : 'auto'}>
                                {row.data[key]}
                            </div>
                        {/each}
                        {#each header_keys as key}
                            <div class={`value ${key}-value`} style:min-width={key in header_sizes ? `${header_sizes[key] + 10}px` : 'auto'}>
                                {#if typeof row.data[key] === 'string'}
                                    <input type="text" class="column-input input-text" bind:value={row.data[key]}/>
                                {:else if typeof row.data[key] === 'number'}
                                    <input type="number" class="column-input input-number" bind:value={row.data[key]}/>
                                {:else if typeof row.data[key] === 'boolean'}
                                    <input type="checkbox" class="column-input input-boolean" bind:checked={row.data[key]}/>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    <div class="controls">
                        {#if details !== undefined}
                        <InteractableDiv oninteract={() => {row.show_details = !row.show_details}}>
                            <span class="material-icons control-icon details-icon" 
                                class:show-details={row.show_details} 
                                class:negate-show-details={!row.show_details}
                            > chevron_right </span>
                        </InteractableDiv>
                        {/if}
                        <InteractableDiv oninteract={() => save(index)}>
                            <span class="material-icons control-icon" class:grayed-out={!can_save[index]}>save</span>
                        </InteractableDiv>
                        <InteractableDiv oninteract={() => del(index)}>
                            <span class="material-icons control-icon">delete</span>
                        </InteractableDiv>
                    </div>
                </div>
                {#if details !== undefined}
                    <div class="details" class:display-none={!row.show_details}>
                        {@render details(row.data, 
                            (key, data) => {
                                row.data[key] = data;
                            })
                        }
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>

    .details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-content: center;
        justify-items: center;
        align-items: center;
    }

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
        align-content: center;
        justify-content: center;
    }

    .header {
        display: flex;
        align-content: center;
        justify-content: center;
    }

    .column-header {
        position: relative;
        display: flex;
    }
    .sort-arrow {
        font-size: 18px;
    }

    .body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-items: center;
    }

    .row {
        display: flex;
    }

    .values {
        display: flex;
    }

    .value {
        min-height: 25px;
        display: flex;
        padding: 3px 0.5em;
    }

    .display-value {
        margin: auto;
        padding: 0;
        align-items: center;
        justify-content: center;
    }

    .column-input {
        margin: auto;
    }
    .input-number {
        width: 4em;
        text-align: center;
    }

    .controls {
        display: flex;
    }

    .control-icon {
        
    }

    .show-details {
        animation: rotate90 0.05s linear forwards;
    }

    .negate-show-details {
        animation: rotate0 0.05s linear forwards;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }

    input[type=number] {
        -moz-appearance:textfield; /* Firefox */
        appearance: textfield;
    }

    @keyframes rotate90 {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(90deg);
        }
    }
    @keyframes rotate0 {
        100% {
            transform: rotate(0deg);
        }
        0% {
            transform: rotate(90deg);
        }
    }

</style>