<script lang="ts">
    import Tree_container from '$components/app/Tree_container.svelte';
    import Toolbar from '$components/app/Toolbar.svelte';
    import { zoomIn, zoomOut } from '$stores';
</script>

<Tree_container />
<Toolbar
    onZoomIn={() => zoomIn()}
    onZoomOut={() => zoomOut()}
/>