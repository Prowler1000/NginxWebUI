<script lang="ts">
	import { isInteraction } from '$lib/accessibility';
	import type { HTMLAttributes } from 'svelte/elements';
	interface Props extends HTMLAttributes<any> {
		oninteract: () => void;
		id?: string;
		style?: string;
		children?: any;
        element?: HTMLDivElement;
	}
	let {
		oninteract,
		id = undefined,
		style = undefined,
		children = undefined,
        element = $bindable(),
		...rest
	}: Props = $props();

    let el: HTMLDivElement;

    $effect(() => {
        element = el;
    })

	const onclick = () => {
		oninteract();
	};
	const onkeypress = (e: any) => {
		if (isInteraction(e)) {
			oninteract();
		}
	};
</script>

<div
	{id}
	bind:this={el}
	{onclick}
	{onkeypress}
	role="button"
	tabindex="0"
	{...rest}
	style={`cursor: pointer; user-select: none; ${style ?? ''}`}
>
	{#if children}
		{@render children()}
	{/if}
</div>
