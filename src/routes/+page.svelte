<script lang="ts">
	import CreateTree from "$components/app/toolbarActions/CreateTree.svelte";
	import TreeSpinner from "$components/ui/TreeSpinner.svelte";
	import UpdateModal from "$components/app/UpdateModal.svelte";
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { goto } from "$app/navigation";
	import { checkForAppUpdates, installUpdate } from "$lib/CheckForUpdates";
	import type { Update } from "@tauri-apps/plugin-updater";
	import { modals } from "$modalStore";
	import { type Settings, setSettings, settingsData, getSetting } from "$settingsStore";

	let updateVersion = $state("");
	let updateObject = $state<Update | null>(null);
	let showSpinner = $state(false);
	let hangAtEnd = $state(false);
	let spinnerText = $state("Checking for updates...");
	let settingsLoaded = $state(false);
	let shouldNavigateToTree = $state(false);

	let disableTree = $derived(getSetting.bool($settingsData, 'disable_tree_loading'));

	$effect(() => {
		if (shouldNavigateToTree && !$modals.appUpdate) {
			goto('/tree');
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

	async function checkTreeExists() {
		try {
			const exists = await invoke<boolean>("check_tree_exists");
			if (exists) {
				modals.close("createTree");
				shouldNavigateToTree = true;
			} else {
				modals.open("createTree");
				showSpinner = false;
			}
		} catch (error) {
			console.error("Error checking if family tree exists:", error);
			showSpinner = false;
		}
	}

	onMount(async () => {
		try {
			if ($settingsData.length === 0) {
				await loadSettings();
			}
			settingsLoaded = true;

			const isUpdateEnabled = getSetting.bool($settingsData, 'check_for_updates');
			const xStartups = getSetting.number($settingsData, 'only_check_updates_every_x_startups');

			if (isUpdateEnabled) {
				const currentLaunches = parseInt(localStorage.getItem("app_launch_count") || "0", 10) + 1;
				localStorage.setItem("app_launch_count", currentLaunches.toString());

				const shouldCheckThisStartup = xStartups <= 1 || (currentLaunches - 1) % xStartups === 0;

				if (shouldCheckThisStartup) {
					showSpinner = true;
					const update = await checkForAppUpdates();

					if (update) {
						updateVersion = update.version;
						updateObject = update;
						showSpinner = false;
						return;
					}
					return;
				}
			}
		} catch (error) {
			console.error("Error checking for updates:", error);
		}

		await checkTreeExists();
	});

	function handleSpinnerComplete() {
		checkTreeExists();
	}

	async function handleUpdateNow() {
		if (!updateObject) return;

		modals.close("appUpdate");
		showSpinner = true;
		spinnerText = "Installing update...";
		hangAtEnd = true;

		try {
			await installUpdate(updateObject);
		} catch (error) {
			console.error("Error installing update:", error);
			showSpinner = false;
			await checkTreeExists();
		}
	}

	function handleDismissUpdate() {
		modals.close("appUpdate");
		showSpinner = false;
		checkTreeExists();
	}
</script>

{#if settingsLoaded}
	<TreeSpinner
		bind:isVisible={showSpinner}
		loadingText={spinnerText}
		{hangAtEnd}
		{disableTree}
		oncomplete={handleSpinnerComplete}
	/>
{/if}

{#if $modals.appUpdate && updateObject}
	<UpdateModal
		isOpen={$modals.appUpdate}
		version={updateVersion}
		onupdate={handleUpdateNow}
		ondismiss={handleDismissUpdate}
	/>
{/if}

<CreateTree />