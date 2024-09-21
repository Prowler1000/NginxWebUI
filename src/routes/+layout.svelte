<script lang="ts">
    interface Props  {
        oninteract: () => void,
        children?: any
    }
    const {
        children = undefined
    }: Props = $props();
</script>

<div class="page-ctr">
    <div class="nav-ctr">
        <nav>
            <a href="/">Home</a>
            <!--<a href="/auth">Auth</a>-->
            <a href="/servers">Servers</a>
            <a href="/ssl">SSL</a>
            <a href="/stream">Stream</a>
        </nav>
    </div>
    <div class="content-ctr">
        {#if children}
            {@render children()}
        {/if}
    </div>
</div>

<style>
    .page-ctr {
        height: 100%;
        margin: 0;
        display: flex;
        flex-direction: column;
    }
    .content-ctr {
        height: 100%;
    }
    .nav-ctr {
        width: 100%;
        text-align: center;
        font-size: 2em;
        background: rgb(121, 121, 121);
        padding: 10px 0;
    }
    nav a {
        margin-left: 10px;
        margin-right: 10px;
        text-decoration: none;
        color: rgb(44, 35, 168)
    }
    :root {
        --select-color: #276cc7;
        margin: 0;
        padding: 0;
    }
    :global(body) {
        margin: 0;
        padding: 0;
        height: 100%;
    }
    :global(html) {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    
    :global(.grayed-out)  {
        filter: contrast(0);
    }
    :global(.display-none) {
        display: none !important;
    }
</style>