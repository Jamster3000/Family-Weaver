<script lang="ts">
    import TreeContainer from '$components/app/TreeContainer.svelte';
    import Toolbar from '$components/app/Toolbar.svelte';
    import { zoomIn, zoomOut } from '$stores';
</script>

<TreeContainer />
<Toolbar
    onZoomIn={() => zoomIn()}
    onZoomOut={() => zoomOut()}
/>