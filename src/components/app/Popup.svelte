<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { IconX } from "@tabler/icons-svelte-runes";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { getAnimationDuration } from "$lib/animationUtils";

	export let isOpen = false;
	export let onClose: (() => void) | undefined = undefined;

	function handleCloseClick() {
		isOpen = false;
		onClose?.();
	}
</script>

{#if isOpen}
	<div
		class="dialog-backdrop"
		data-testid="popup-backdrop"
		role="presentation"
		tabindex="-1"
		transition:fade={{ duration: getAnimationDuration() }}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="dialog-container"
			transition:fly={{ y: 20, duration: getAnimationDuration(), easing: quintOut }}
		>
			<div class="content-wrapper">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		left: 0;
		right: 0;
		top: calc(var(--titlebar-height, 0px) + var(--header-height, 0px));
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1000;
	}

	.dialog-container {
		width: 100%;
		height: 100%;
		position: relative;
		background: transparent;
		padding: var(--page-padding);
		margin: 0;
		overflow: auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content-wrapper {
		position: relative;
		width: 100%;
		display: flex;
		justify-content: center;
		max-height: 90vh;
		overflow-y: auto;
	}

	@media (max-height: 800px) {
		.dialog-container {
			padding: var(--titlebar-height) 20px 100px 20px;
			align-items: flex-start;
		}

		.content-wrapper {
			max-height: 85vh;
		}
	}

	@media (max-height: 600px) {
		.dialog-container {
			padding: var(--titlebar-height) 20px 80px 20px;
		}

		.content-wrapper {
			max-height: 80vh;
		}
	}
</style>
