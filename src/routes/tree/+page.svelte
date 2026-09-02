<script lang="ts">
	import TreeContainer from "$components/app/TreeContainer.svelte";
	import Toolbar from "$components/app/Toolbar.svelte";
	import WhatsNewButton from "$components/app/whatsNew/WhatsNewButton.svelte";
	import { zoomIn, zoomOut } from "$networkStore";
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { personTreeStore, type Person } from "$personTreeStore";

	let containerHeight = 0;
	let loading = true;
	let error: String | null = null;

	// Reactively update the CSS variable whenever the height changes
	$: if (typeof document !== 'undefined' && containerHeight) {
		const gap = 16;
		const bottomOffset = 30;
		const totalOffset = containerHeight + bottomOffset + gap;
		document.documentElement.style.setProperty('--toast-bottom', `${totalOffset}px`);
	}

	onMount(async () => {
		try {
			const people = await invoke<Person[]>('get_all_people');
			personTreeStore.set(people);
		} catch (err) {
			console.error("Failed to fetch people for active tree:", err);
			error = typeof err === 'string' ? err :  "Failed to load people data";
		} finally {
			loading = false;
		}
	});
</script>

<TreeContainer />

<div class="bottom-container" bind:offsetHeight={containerHeight}>
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
