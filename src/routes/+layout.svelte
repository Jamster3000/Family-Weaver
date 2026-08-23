<script lang="ts">
    import '../app.css';
    import { navigating } from '$app/stores';
    import Titlebar from '$components/app/Titlebar.svelte';
    import ToastContainer from '$components/app/ToastContainer.svelte';
    import { onMount } from 'svelte';
    import { checkForAppUpdatesBackground } from '$lib/CheckForUpdates';

    onMount(() => {
        checkForAppUpdatesBackground();

        const updateCheckInterval = setInterval(() => {
            checkForAppUpdatesBackground();
        }, 2 * 60 * 60 * 1000); // Check for updates every hour
    });
</script>

<Titlebar />
<ToastContainer />
<slot />