<script lang="ts">
	import type { Snippet } from "svelte";
	import { fade } from "svelte/transition";
	import { getAnimationDuration } from "$lib/animationUtils";

	let {
		text = "",
		delay = 350,
		position = "top",
		children,
	}: {
		text?: string;
		delay?: number;
		position?: "top" | "bottom" | "left" | "right";
		children?: Snippet;
	} = $props();

	let isVisible = $state(false);
	let timeoutId: ReturnType<typeof setTimeout>;

	let wrapperNode: HTMLDivElement | undefined = $state();
	let tooltipTop = $state(0);
	let tooltipLeft = $state(0);

	function updatePosition() {
		if (!isVisible || !wrapperNode) return;

		const target = wrapperNode.firstElementChild as HTMLElement;
		if (!target) return;

		const rect = target.getBoundingClientRect();

		if (position === "top") {
			tooltipTop = rect.top;
			tooltipLeft = rect.left + rect.width / 2;
		} else if (position === "bottom") {
			tooltipTop = rect.bottom;
			tooltipLeft = rect.left + rect.width / 2;
		} else if (position === "left") {
			tooltipTop = rect.top + rect.height / 2;
			tooltipLeft = rect.left;
		} else if (position === "right") {
			tooltipTop = rect.top + rect.height / 2;
			tooltipLeft = rect.right;
		}
	}

	function showTooltip() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			isVisible = true;
			updatePosition();
		}, delay);
	}

	function hideTooltip() {
		clearTimeout(timeoutId);
		isVisible = false;
	}

	// takes the tooltip out of the DOM hierarchy and puts it in the body level
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			},
		};
	}
</script>

<svelte:window onscrollcapture={updatePosition} onresize={updatePosition} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={wrapperNode}
	class="tooltip-wrapper"
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	onfocusin={showTooltip}
	onfocusout={hideTooltip}
	onclick={hideTooltip}
>
	{#if children}{@render children()}{/if}
</div>

{#if isVisible && text}
	<div
		use:portal
		class="tooltip {position}"
		style="top: {tooltipTop}px; left: {tooltipLeft}px;"
		transition:fade={{ duration: getAnimationDuration() / 2.75 }}
	>
		{text}
	</div>
{/if}

<style>
	.tooltip-wrapper {
		display: contents;
	}

	.tooltip {
		position: fixed;
		background: var(--text-colour);
		color: var(--secondary-background);
		padding: 12px 16px;
		border-radius: 6px;
		font-size: var(--font-small);
		font-family: var(--font-primary);
		white-space: normal;
		max-width: 320px;
		line-height: 1.4;
		pointer-events: none;
		z-index: 9999;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
	}

	.tooltip.top {
		transform: translate(-50%, calc(-100% - 4px));
	}

	.tooltip.bottom {
		transform: translate(-50%, 4px);
	}

	.tooltip.left {
		transform: translate(calc(-100% - 4px), -50%);
	}

	.tooltip.right {
		transform: translate(4px, -50%);
	}
</style>
