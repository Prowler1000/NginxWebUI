<script lang="ts" generics="T extends {[key: string]: unknown}">
	import InteractableDiv from '$lib/accessibility/InteractableDiv.svelte';
import { createRawSnippet, type Snippet } from 'svelte';

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

</script>

<div class="content">
    <div class="header">
        {#each header_keys as key}
            <div class="column-name" style:width={`calc(100% / ${header_keys.length})`}>
                {key_label_map[key]}:
            </div>
        {/each}
    </div>
    <div class="table">

        <!-- Where the layout of each row is defined -->
        {#each data as row}
            <div class="row">
                <div class="row-header">
                    <div class="row-inputs">
                        {#each header_keys as key}
                        <div class="column-value" style:width={`calc(100% / ${header_keys.length})`}>
                            {#if typeof row[key] === 'string'}
                                <input class="input-text" type="text" bind:value={row[key]} />
                            {:else if typeof row[key] === 'number'}
                                <input class="input-number" type="numeric" bind:value={row[key]} />
                            {:else if typeof row[key] === 'boolean'}
                                <input class="input-boolean" type="checkbox" bind:checked={row[key]} />
                            {/if}
                        </div>
                        {/each}
                    </div>
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
                </div>
            </div>
        {/each}

        
    </div>
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 15px;
    }

    .header {
        display: flex;
        flex-direction: row;
        width: 80%;
    }

    .column-name {
        margin: auto;
        text-align: center;
    }

    .table {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        width: 100%;
    }

    .row-header {
        width: 100%;
        display: flex;
    }

    .row-inputs {
        display: flex;
        width: 80%;
    }

    .column-value {
        margin: auto;
        text-align: center;
    }
    .column-value input {
        margin: auto;
    }

    .btn-ctr {
        margin: auto;
        display: flex;
    }

</style>