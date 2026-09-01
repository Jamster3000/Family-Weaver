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
    import { getVersion } from '@tauri-apps/api/app';

    let { children } = $props();

    let updateIntervalTimer: ReturnType<typeof setInterval> | null = null;

    $effect(() => {
        if ($settingsData.length > 0) {
            setupUpdateInterval();
            applyVisualSettings($settingsData);
        }
    });

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

        if (intervalHours > 0) {
            updateIntervalTimer = setInterval(() => {
                checkForAppUpdatesBackground();
            }, intervalHours * 60 * 60 * 1000);
        }
    }

    async function cacheReleaseNotes() {
        try {
            const currentVersion = await getVersion();
            const cachedVersion = localStorage.getItem('cached_release_version');

            if (cachedVersion !== currentVersion) {
                const releaseInfo: { notes: string } = await invoke('fetch_version_release', {
                    version: currentVersion
                });

                if (releaseInfo && releaseInfo.notes) {
                    localStorage.setItem('cached_release_version', currentVersion);
                    localStorage.setItem('cached_release_notes', releaseInfo.notes);
                }
            }
        } catch (error) {
            console.error("Failed to fetch release notes:", error);
        }
    }

    onMount(() => {
        loadSettings();
        applyVisualSettings($settingsData);

        checkForAppUpdatesBackground();
        cacheReleaseNotes();

        onDestroy(() => {
            if (updateIntervalTimer) {
                clearInterval(updateIntervalTimer);
            }
        });
    });
</script>

<Titlebar />
<ToastContainer />
{@render children()}