<script lang="ts" generics="T extends {[key: string]: unknown}">

type Props = {
    title: string,
    options: T[],
    key_prop: keyof T,
    name_prop: keyof T,
    value: T[keyof T] | null,
    nullable?: boolean,
    nullable_name?: string,
    onselectchange?: (e: Event & { currentTarget: EventTarget & HTMLSelectElement}) => void
}
let {
    title,
    options,
    key_prop,
    name_prop,
    value = $bindable(),
    nullable = false,
    nullable_name = "Default",
    onselectchange,
}: Props = $props();

</script>

<div class="ctr">
    <div class="title">
        {title}
    </div>
    <div class="menu">
        <select bind:value={value} onchange={onselectchange}>
            {#if nullable}
                <option value={null} selected={value === null}>{nullable_name}</option>
            {/if}
            {#each options as opt}
                <option value={opt[key_prop]} selected={value === opt[key_prop]}>{opt[name_prop]}</option>
            {/each}
        </select>
    </div>
</div>

<style>

</style>