<script lang="ts">
	import { isInteraction } from "$lib/accessibility";
    import type { HTMLAttributes } from "svelte/elements";
    interface Props extends HTMLAttributes<any> {
        oninteract: () => void,
        children?: any
    }
    const {
        oninteract,
        children = undefined,
        ...rest
    }: Props = $props();

    const onclick = () => {
        oninteract();
    }
    const onkeypress = (e: any) => {
        if (isInteraction(e)) {
            oninteract();
        }
    }
</script>

<div onclick={onclick} onkeypress={onkeypress} role="button" tabindex="0" {...rest} style="cursor: pointer; user-select: none;">
    {#if children}
        {@render children()}
    {/if}
</div>
