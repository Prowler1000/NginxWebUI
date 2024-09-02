<script lang="ts">
    const grey = "#808080";
    const green = "#28b013";
    const red = "#d1111a";
    const orange = "#e37b0b";
    
    let deploy_file_color = $state(grey);
    let nginx_restart_color = $state(grey);

    async function deploy() {
        deploy_file_color = orange;
        nginx_restart_color = orange;
        const deploy_res = await fetch("/api/v1/Deploy", {
            method: 'POST',
        });
        deploy_file_color = deploy_res.status === 200 ? green : red;
        const restart_res = await fetch("/api/v1/Restart-Nginx", {
            method: 'POST',
        });
        nginx_restart_color = restart_res.status === 200 ? green : red;
    }

</script>

<div class="page-ctr">
    <div class="deploy-ctr">
        <button onclick={deploy}>Deploy</button>
    </div>
    <div class="status-ctr">
        <div class="status">
            <div>File Deployment:</div>
            <div class="square" style="background-color: {deploy_file_color}"></div>
        </div>
    <div class="status">
            <div>Nginx Restart:</div>
            <div class="square" style="background-color: {nginx_restart_color}"></div>
        </div>
    </div>
</div>

<style>
    .page-ctr {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        margin: 0;
        justify-items: center;
        align-items: center;
    }
    .deploy-ctr {
        margin-top: 10px;
    }
    .deploy-ctr button {
        padding: 5px;
        font-size: large;
    }
    .status-ctr {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-items: center;
    }
    .status {
        display: flex;
        align-items: center;
        justify-items: center;
    }
    .square {
        width: 20px;
        height: 20px;
        margin: 5px;
    }
</style>
