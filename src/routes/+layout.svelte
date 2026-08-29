<script lang="ts">
    import '../app.css';
    import '../theme.css';
    import '../fonts.css';
    import Titlebar from '$components/app/Titlebar.svelte';
    import ToastContainer from '$components/app/ToastContainer.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { checkForAppUpdatesBackground } from '$lib/CheckForUpdates';
    import { settingsData, type Settings, setSettings, getSetting } from '$settingsStore';
    import { applyVisualSettings, applyFontFamily, applyFontScale } from '$lib/applySettings';
    import { invoke } from '@tauri-apps/api/core';

    let updateIntervalTimer: ReturnType<typeof setInterval> | null = null;

    $: if ($settingsData.length > 0) {
        setupUpdateInterval();
        applyVisualSettings($settingsData);
    }

    async function loadSettings() {
		try {
			const settings = await invoke<Settings[]>("get_all_settings");
			setSettings(settings);
		} catch (error) {
			console.error("Error fetching settings on startup:", error);
		}
	}

    function setupUpdateInterval() {
        if (updateIntervalTimer) {
            clearInterval(updateIntervalTimer);
            updateIntervalTimer = null;
        }

        const isUpdateEnabled = getSetting.bool($settingsData, "check_for_updates");

        if (!isUpdateEnabled) return;

        const intervalHours = getSetting.number($settingsData, "check_for_updates_interval_hours");

        // Setting interval to 0 disables runtime checks
        if (intervalHours > 0) {
            updateIntervalTimer = setInterval(() => {
                checkForAppUpdatesBackground();
            }, intervalHours * 60 * 60 * 1000);
        }
    }

    onMount(() => {
        loadSettings();
        applyVisualSettings($settingsData);

        checkForAppUpdatesBackground();

        onDestroy(() => {
            if (updateIntervalTimer) {
                clearInterval(updateIntervalTimer);
            }
        });
    });
</script>

<Titlebar />
<ToastContainer />
<slot />