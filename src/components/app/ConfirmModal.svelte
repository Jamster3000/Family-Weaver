<script lang="ts">
	import Button from "$components/ui/Button.svelte";
	import Modal from "$components/ui/Modal.svelte";

	export let isOpen: boolean;
	export let title: string;
	export let message: string;
	export let confirmLabel: string = "Confirm";
	export let cancelLabel: string = "Cancel";
	export let onConfirm: () => void;
	export let onClose: () => void;
	export let width: string = "40%";
</script>

<Modal {isOpen} {width} padding="small" {onClose}>
	<svelte:fragment slot="header"><h2>{title}</h2></svelte:fragment>
	<p class="confirm-message">{message}</p>
	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={onClose}>{cancelLabel}</Button>
		<Button on:click={onConfirm}>{confirmLabel}</Button>
	</svelte:fragment>
</Modal>
