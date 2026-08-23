<script lang="ts">
    import '../app.css';
    import { navigating } from '$app/stores';
    import { fade } from 'svelte/transition';
    import Titlebar from '$components/app/Titlebar.svelte';
    import ToastContainer from '$components/app/ToastContainer.svelte';
</script>

<Titlebar />
<ToastContainer />
<slot />