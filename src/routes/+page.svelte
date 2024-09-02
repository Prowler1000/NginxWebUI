<script lang="ts">

    async function deploy() {
        await fetch("/api/v1/Deploy", {
            method: 'POST',
        });
        await fetch("/api/v1/Restart-Nginx", {
            method: 'POST',
        });
    }

</script>

<div class="page-ctr">
    <button onclick={deploy}>Deploy</button>
</div>

<style>

</style>