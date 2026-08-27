<script lang="ts">
	import { fly } from "svelte/transition";
	import {
		IconCheck,
		IconAlertCircle,
		IconInfoCircle,
	} from "@tabler/icons-svelte-runes";
	import Close from "$components/ui/Close.svelte";
	import { onMount } from "svelte";
	import { getAnimationDuration } from "$lib/animationUtils";
	import { settingsData } from "$settingsStore";

	export let message: string = "";
	export let type: "success" | "error" | "info" = "info";
	export let onDismiss: (() => void) | undefined = undefined;
	export let duration: number | undefined = undefined;

	$: effectiveDuration = (() => {
		if (duration !== undefined) return duration;

		const toastSetting = $settingsData.find(
			(s) => s.key === "toast_appearance_time",
		);
		const seconds = toastSetting?.value && "Float" in toastSetting.value
			? toastSetting.value.Float
			: 4;

		return seconds * 1000;
	})();

	let isVisible = true;

	const icons = {
		success: IconCheck,
		error: IconAlertCircle,
		info: IconInfoCircle,
	};

	function handleDismiss() {
		isVisible = false;
		setTimeout(() => {
			onDismiss?.();
		}, 300);
	}

	let timeout: ReturnType<typeof setTimeout>;

	$: if (effectiveDuration > 0 && isVisible) {
		clearTimeout(timeout);
		timeout = setTimeout(handleDismiss, effectiveDuration);
	}

	onMount(() => {
		return () => clearTimeout(timeout);
	});
</script>

{#if isVisible}
	<div
		class="toast toast-{type}"
		transition:fly={{ x: 400, duration: getAnimationDuration() * 2 }}
		role="alert"
		aria-live="polite"
	>
		<div class="toast-icon">
			<svelte:component this={icons[type]} size={20} />
		</div>

		<div class="toast-content">
			<p>{message}</p>
		</div>

		<div class="toast-close">
			<Close onClick={handleDismiss} size={16} />
		</div>
	</div>
{/if}

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid;
		background-color: var(--primary-background);
		color: var(--text-colour);
		font-size: var(--font-medium);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		min-width: 300px;
		max-width: 400px;
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.toast-content {
		flex: 1;
		margin: 0;
	}

	.toast-content p {
		margin: 0;
		font-size: var(--font-medium);
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-left: 18px;
	}

	.toast-success {
		border-color: var(--toast-success-colour);
		background-color: color-mix(
			in srgb,
			var(--toast-success-colour) 10%,
			var(--primary-background)
		);
	}

	.toast-success .toast-icon {
		color: var(--toast-success-colour);
	}

	.toast-error {
		border-color: var(--toast-error-colour);
		background-color: color-mix(
			in srgb,
			var(--toast-error-colour) 10%,
			var(--primary-background)
		);
	}

	.toast-error .toast-icon {
		color: var(--toast-error-colour);
	}

	.toast-info {
		border-color: var(--toast-info-colour);
		background-color: color-mix(
			in srgb,
			var(--toast-info-colour) 10%,
			var(--primary-background)
		);
	}

	.toast-info .toast-icon {
		color: var(--toast-info-colour);
	}
</style>
