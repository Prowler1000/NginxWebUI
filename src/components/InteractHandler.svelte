<script lang="ts">
	import { GetInteractType, InteractType, type KeyboardElementEvent, type MouseElementEvent } from "$lib/accessibility";
	import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<any> {
        oninteract: (itype: InteractType) => void,
        type: "div" | "tr",
        timeout?: number,
        children?: any
    };
    const {
        oninteract,
        type,
        timeout,
        children,
        ...rest
    }: Props = $props();

    let timer: NodeJS.Timeout;

    const callInteract = (iType: InteractType) => {
        if (iType !== InteractType.INVALID) {
            oninteract(iType);
        }
    }

    const onclick = (e: MouseElementEvent) => {
        let iType = GetInteractType(e);
        if (iType === InteractType.DOUBLE) {
            clearTimeout(timer);
            callInteract(iType);
        }
        else if (iType === InteractType.BASIC) {
            if (timeout !== undefined) {
                timer = setTimeout(() => {
                    callInteract(iType);
                }, timeout);
            }
            else {
                callInteract(iType);
            }
        }
        else {
            callInteract(iType);
        }
    }

    const onkeypress = (e: KeyboardElementEvent) => {
        let iType = GetInteractType(e);
        callInteract(iType);
    }

</script>

{#if type === "div"}
<div onclick={onclick} role="button" tabindex="0" onkeypress={onkeypress} {...rest} style="cursor:pointer; user-select:none">
    {#if children}
        {@render children()}
    {/if}
</div>
{:else if type ==="tr"}
<tr onclick={onclick} role="button" tabindex="0" onkeypress={onkeypress} {...rest}>
    {#if children}
        {@render children()}
    {/if}
</tr>
{/if}