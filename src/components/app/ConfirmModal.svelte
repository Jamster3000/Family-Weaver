<script lang="ts">
	import Button from "$components/ui/Button.svelte";
	import Modal from "$components/ui/Modal.svelte";

	let {
		isOpen = false,
		title = "",
		message = "",
		confirmLabel = "Confirm",
		cancelLabel = "Cancel",
		onConfirm,
		onClose,
		width = "40%",
	}: {
		isOpen?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm?: () => void;
		onClose?: () => void;
		width?: string;
	} = $props();
</script>

<Modal {isOpen} {width} padding="small" {onClose}>
	{#snippet header()}
		<h2>{title}</h2>
	{/snippet}

	<p class="confirm-message">{message}</p>

	{#snippet footer()}
		<Button variant="secondary" onclick={onClose}>{cancelLabel}</Button>
		<Button onclick={onConfirm}>{confirmLabel}</Button>
	{/snippet}
</Modal>