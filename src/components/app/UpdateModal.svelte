<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import { updateStore } from "$updateStore";

	let {
		isOpen = false,
		version = "",
		onupdate = () => {},
		ondismiss = () => {}
	}: {
		isOpen?: boolean;
		version?: string;
		onupdate?: () => void;
		ondismiss?: () => void;
	} = $props();

	function handleClose() {
		// Set flag that update is pending for toolbar to show
		updateStore.setUpdateAvailable(version);
		isOpen = false;
		ondismiss();
	}
</script>

<Modal {isOpen} width="540px" onClose={handleClose}>
	{#snippet header()}
		<h2>Software Update Available</h2>
	{/snippet}

	<div class="content-box">
		<p>
			{#if version}
				Version {version} is now available for Family Weaver.
			{:else}
				A new version is available for Family Weaver.
			{/if}
			Would you like to install this update now?
		</p>
	</div>

	{#snippet footer()}
		<Button variant="secondary" type="button" onclick={handleClose}>
			Later
		</Button>
		<Button variant="primary" type="button" onclick={onupdate}>
			Update Now
		</Button>
	{/snippet}
</Modal>

<style>
	.content-box {
		width: 100%;
		background: var(--primary-background);
		border: 1px solid var(--border-colour);
		border-radius: 12px;
		padding: 20px;
		box-sizing: border-box;
	}

	p {
		margin: 0;
		color: var(--text-colour);
		font-size: var(--font-medium);
		line-height: 1.5;
	}
</style>
