<script lang="ts">
	import { onMount } from "svelte";
	import { getVersion } from "@tauri-apps/api/app";
	import { invoke } from "@tauri-apps/api/core";
	import TreeContainer from "$components/app/TreeContainer.svelte";
	import Toolbar from "$components/app/Toolbar.svelte";
	import WhatsNewButton from "$components/app/whatsNew/WhatsNewButton.svelte";
	import { zoomIn, zoomOut } from "$networkStore";
	import TreeSpinner from "$components/ui/TreeSpinner.svelte";

	let releaseNotes = "";
	let initTask: Promise<void> | null = null;

	// CORRECTED
	onMount(() => {
		initTask = (async () => {
			try {
				const currentVersion = await getVersion();
				const cachedVersion = localStorage.getItem(
					"cached_release_version",
				);
				const cachedNotes = localStorage.getItem(
					"cached_release_notes",
				);

				// fetch release notes if the app version is different from the cached verion in localstorage
				if (cachedVersion !== currentVersion) {
					const response: any = await invoke(
						"fetch_version_release",
						{ version: currentVersion },
					);
					if (response && response.notes) {
						releaseNotes = response.notes;
						localStorage.setItem(
							"cached_release_version",
							currentVersion,
						);
						localStorage.setItem(
							"cached_release_notes",
							response.notes,
						);
					}
				} else if (cachedNotes) {
					releaseNotes = cachedNotes;
				}
			} catch (error) {
				console.error("Failed to load release notes:", error);
			}
		})();
	});
</script>

<TreeSpinner
	loadingText="Checking for updates..."
	waitFor={initTask}
	hangAtEnd={false}
/>

<TreeContainer />

<div class="bottom-container">
	<div class="left-section">
		<WhatsNewButton />
	</div>
	<div class="center-section">
		<Toolbar onZoomIn={() => zoomIn()} onZoomOut={() => zoomOut()} />
	</div>
	<div class="right-section"></div>
</div>

<style>
	.bottom-container {
		position: fixed;
		bottom: 30px;
		left: 30px;
		right: 30px;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		z-index: 999;
		pointer-events: none;
	}

	.left-section,
	.center-section,
	.right-section {
		pointer-events: auto;
	}

	.left-section {
		justify-self: start;
	}

	.center-section {
		justify-self: center;
	}
</style>
