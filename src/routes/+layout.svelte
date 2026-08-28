<script lang="ts">
    import '../app.css';
    import '../theme.css';
    import '../fonts.css';
    import { navigating } from '$app/stores';
    import Titlebar from '$components/app/Titlebar.svelte';
    import ToastContainer from '$components/app/ToastContainer.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { checkForAppUpdatesBackground } from '$lib/CheckForUpdates';
    import { settingsData, type Settings, setSettings } from '$settingsStore';
    import { applyTheme, type AppearanceMode } from "$themeStore";
    import { applyVisualSettings } from '$lib/visualSettings';
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

        const checkForSettings = $settingsData.find(s => s.key === 'check_for_updates');
        const isUpdateEnabled = checkForSettings?.value && "Bool" in checkForSettings.value ? checkForSettings.value.Bool : true;

        if (!isUpdateEnabled) return;

        const intervalSetting = $settingsData.find(s => s.key === 'check_for_updates_interval_hours');
        const intervalHours = intervalSetting?.value && "Int" in intervalSetting.value ? intervalSetting.value.Int : 2;

        // Setting interval to 0 disables runtime checks
        if (intervalHours > 0) {
            updateIntervalTimer = setInterval(() => {
                checkForAppUpdatesBackground();
            }, intervalHours * 60 * 60 * 1000);
        }
    }

    onMount(() => {
        loadSettings();
        const appearanceSetting = $settingsData.find(s => s.key === 'appearance_mode');

        if (appearanceSetting?.value && "Text" in appearanceSetting.value) {
			applyTheme(appearanceSetting.value.Text as AppearanceMode);
		}

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