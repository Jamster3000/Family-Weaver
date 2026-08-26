<script lang="ts">
    import '../app.css';
    import '../theme.css';
    import '../fonts.css';
    import { navigating } from '$app/stores';
    import Titlebar from '$components/app/Titlebar.svelte';
    import ToastContainer from '$components/app/ToastContainer.svelte';
    import { onMount } from 'svelte';
    import { checkForAppUpdatesBackground } from '$lib/CheckForUpdates';
    import { settingsData } from '$settingsStore';
    import { applyTheme, type AppearanceMode } from "$themeStore";

    onMount(() => {
        const appearanceSetting = $settingsData.find(s => s.key === 'appearance_mode');

        if (appearanceSetting?.value && "Text" in appearanceSetting.value) {
			applyTheme(appearanceSetting.value.Text as AppearanceMode);
		}

        checkForAppUpdatesBackground();

        const updateCheckInterval = setInterval(() => {
            checkForAppUpdatesBackground();
        }, 2 * 60 * 60 * 1000); // Check for updates every hour
    });
</script>

<Titlebar />
<ToastContainer />
<slot />