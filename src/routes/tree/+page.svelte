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

	let containerHeight = 0;

	// Reactively update the CSS variable whenever the height changes
	$: if (typeof document !== 'undefined' && containerHeight) {
		const gap = 16;
		const bottomOffset = 30;
		const totalOffset = containerHeight + bottomOffset + gap;
		document.documentElement.style.setProperty('--toast-bottom', `${totalOffset}px`);
	}

	onMount(() => {
		// ... existing onMount logic
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
