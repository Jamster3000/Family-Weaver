<script lang="ts">
	import type { Snippet } from "svelte";
	import Popup from "$components/app/Popup.svelte";
	import Card from "$components/ui/Card.svelte";
	import Close from "$components/ui/Close.svelte";

	let {
		isOpen = false,
		width = "540px",
		padding = "large",
		center = true,
		title = "",
		showClose = true,
		onClose = undefined,
		children,
		header,
		footer,
	}: {
		isOpen?: boolean;
		width?: string;
		padding?: "none" | "small" | "medium" | "large";
		center?: boolean;
		title?: string;
		showClose?: boolean;
		onClose?: (() => void) | undefined;
		children?: Snippet;
		header?: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<Popup {isOpen} onclose={onClose}>
	<Card {width} {padding} {center}>
		{#if showClose}
			<Close onclick={onClose} />
		{/if}

		<div class="modal-content">
			{#if title || header}
				<div class="modal-header" class:has-close={showClose}>
					{#if header}
						{@render header()}
					{:else}
						<h2>{title}</h2>
					{/if}
				</div>
			{/if}

			<div class="modal-body">
				{#if children}{@render children()}{/if}
			</div>

			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</Card>
</Popup>

<style>
	.modal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
	}

	.modal-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
		text-align: center;
		box-sizing: border-box;
		word-break: break-word;
		overflow-wrap: anywhere;
	}

	.modal-header.has-close {
		padding: 0 36px;
	}

	.modal-header h2 {
		margin: 0;
		font-size: var(--font-xlarge, 1.75rem);
		font-weight: 700;
		color: var(--text-colour);
	}

	.modal-body {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.modal-footer {
		display: flex;
		gap: 16px;
		justify-content: center;
		width: 100%;
	}

	.modal-footer :global(.btn) {
		min-width: 140px;
		padding: 12px 24px;
		font-size: var(--font-medium);
	}
</style>
