<script lang="ts">
	import CreateTree from "$components/app/toolbarActions/CreateTree.svelte";
	import TreeSpinner from "$components/ui/TreeSpinner.svelte";
	import UpdateModal from "$components/app/UpdateModal.svelte";
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { goto } from "$app/navigation";
	import { checkForAppUpdates, installUpdate } from "$lib/CheckForUpdates";
	import type { Update } from "@tauri-apps/plugin-updater";
	import { modals, createTreeModal } from "$modalStore";
	import { type Settings, setSettings, settingsData } from "$settingsStore";

	let updateModalOpen: boolean = false;
	let updateVersion: string = "";
	let updateObject: Update | null = null;
	let showSpinner = true;
	let hangAtEnd = false;
	let spinnerText = "Checking for updates...";
	let enableUpdateModal = true;

	async function checkTreeExists() {
		try {
			const exists = await invoke<boolean>("check_tree_exists");
			if (exists) {
				modals.close("createTree");
				await goto("/tree");
			} else {
				modals.open("createTree");
				showSpinner = false;
			}
		} catch (error) {
			console.error("Error checking if family tree exists:", error);
			showSpinner = false;
		}
	}

	async function getSettings() {
		try {
			const settings = await invoke<Settings[]>("get_all_settings");
			setSettings(settings);
		} catch (error) {
			console.error("Error getting settings:", error);
		}
	}

	onMount(async () => {
		try {
			await getSettings();

			const checkForSettings = $settingsData.find(s => s.key === 'check_for_updates');

			if (checkForSettings?.value && "Bool" in checkForSettings.value && checkForSettings.value.Bool) {
				const update = await checkForAppUpdates();

				if (update) {
					updateVersion = update.version;
					updateObject = update;
					showSpinner = false;
					updateModalOpen = true;
					return;
				}
			}
		} catch (error) {
			console.error("Error checking for updates:", error);
		}

		await checkTreeExists();
	});

	async function handleUpdateNow() {
		if (!updateObject) return;

		updateModalOpen = false;
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
		updateModalOpen = false;
		showSpinner = false;
		checkTreeExists();
	}
</script>

<TreeSpinner
	bind:isVisible={showSpinner}
	loadingText={spinnerText}
	{hangAtEnd}
/>

{#if updateModalOpen && updateObject}
	<UpdateModal
		bind:isOpen={updateModalOpen}
		version={updateVersion}
		onUpdate={handleUpdateNow}
		onDismiss={handleDismissUpdate}
	/>
{/if}

<CreateTree firstTime={true} />
