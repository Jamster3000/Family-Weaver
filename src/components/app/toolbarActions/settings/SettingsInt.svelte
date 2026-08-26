<script lang="ts">
	import type { Settings } from "$settingsStore";

	export let setting: Settings;

	let minValue = 1;
	let maxValue = 100;

	$: if (setting.min && "Int" in setting.min) {
		minValue = setting.min.Int;
	}
	$: if (setting.max && "Int" in setting.max) {
		maxValue = setting.max.Int;
	}

	let currentValue = setting.value && "Int" in setting.value
		? setting.value.Int
		: minValue;

	$: if (setting.value && "Int" in setting.value) {
		setting.value.Int = currentValue;
		console.log(`Set ${setting.key} to ${currentValue}`);
	}
</script>

<div class="int-control">
	<input
		type="range"
		min={minValue}
		max={maxValue}
		bind:value={currentValue}
		class="slider"
		aria-label={setting.name}
	/>

	<input
		type="number"
		min={minValue}
		max={maxValue}
		bind:value={currentValue}
		class="number-input"
		aria-label={`${setting.name} value`}
	/>
</div>

<style>
	.int-control {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		max-width: 280px;
	}

	.slider {
		flex: 1;
		height: 6px;
		border-radius: 3px;
		background: color-mix(
			in srgb,
			var(--border-colour) 40%,
			transparent
		);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--primary-colour);
		cursor: pointer;
		transition: all var(--xshort-transition-duration) ease;
		border: 2px solid var(--primary-colour);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.slider::-webkit-slider-thumb:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transform: scale(1.1);
	}

	.slider::-webkit-slider-thumb:active {
		transform: scale(0.95);
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--primary-colour);
		cursor: pointer;
		transition: all var(--xshort-transition-duration) ease;
		border: 2px solid var(--primary-colour);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.slider::-moz-range-thumb:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		transform: scale(1.1);
	}

	.slider:focus-visible {
		outline: 2px solid var(--primary-colour);
		outline-offset: 2px;
	}

	.number-input {
		width: 80px;
		padding: 8px 12px;
		background: color-mix(in srgb, var(--secondary-background) 75%, black);
		border: 2px solid color-mix(
			in srgb,
			var(--border-colour) 50%,
			transparent
		);
		border-radius: 6px;
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		color: var(--text-colour);
		text-align: center;
		transition: all var(--xshort-transition-duration) ease;
	}

	.number-input:hover {
		border-color: var(--primary-colour);
	}

	.number-input:focus {
		outline: none;
		border-color: var(--primary-colour);
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--primary-colour) 40%, transparent);
	}

	.number-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.number-input::-webkit-outer-spin-button,
	.number-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>