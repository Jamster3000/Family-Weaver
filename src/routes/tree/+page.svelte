<script lang="ts">
    import TreeContainer from '$components/app/TreeContainer.svelte';
    import Toolbar from '$components/app/Toolbar.svelte';
    import WhatsNewButton from '$components/app/whatsNew/WhatsNewButton.svelte';
    import { zoomIn, zoomOut } from '$stores';
</script>

<TreeContainer />

<div class="bottom-container">
    <div class="left-section">
        <WhatsNewButton />
    </div>
    <div class="center-section">
        <Toolbar
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
        />
    </div>
    <div class="right-section"></div>
</div>

<style>
    .bottom-container {
        position: fixed;
        bottom: 30px;
        left: 30px;
        right: 30px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        z-index: 999;
        pointer-events: none;
    }

    .left-section, .center-section, .right-section {
        pointer-events: auto;
    }

    .left-section {
        justify-self: start;
    }

    .center-section {
        justify-self: center;
    }
</style>