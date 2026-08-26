<script lang="ts">
	import { type Settings, updateSettings, applyFontFamily } from "$settingsStore";
	import { applyTheme, type AppearanceMode } from "$themeStore";

	export let setting: Settings;

	let options: string[] = [];

	$: if (setting.value_type && typeof setting.value_type === "object" && "Enum" in setting.value_type) {
		options = setting.value_type.Enum;
	}

	let currentValue = setting.value && "Text" in setting.value
		? setting.value.Text
		: options[0] ?? "";

	function handleChange(e: Event) {
		const target = e.currentTarget as HTMLSelectElement;
		const newValue = target.value;

		if (setting.key === "appearance_mode") {
			applyTheme(newValue as AppearanceMode);
		}
		if (setting.key === "font_family") {
			applyFontFamily(newValue);
		}

		// Update the store once, with the actual changed value
		updateSettings([{ key: setting.key, value: { Text: newValue } }]);
	}
</script>

<div class="enum-select-wrapper">
	<select
		value={currentValue}
		on:change={handleChange}
		aria-label={setting.name}
		class="enum-select"
	>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
	<span class="select-arrow"></span>
</div>

<style>
	.enum-select-wrapper {
		position: relative;
		display: inline-block;
		width: 100%;
		max-width: 440px;
	}

	.enum-select {
		width: 100%;
		padding: 10px 16px;
		padding-right: 40px;
		background: color-mix(in srgb, var(--secondary-background) 75%, black);
		border: 2px solid color-mix(
			in srgb,
			var(--border-colour) 50%,
			transparent
		);
		border-radius: 8px;
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		color: var(--text-colour);
		cursor: pointer;
		appearance: none;
		transition: all 0.2s ease;
	}

	.enum-select:hover {
		border-color: var(--primary-colour);
		background: color-mix(
			in srgb,
			var(--secondary-background) 80%,
			white 5%
		);
	}

	.enum-select:focus {
		outline: none;
		border-color: var(--primary-colour);
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--primary-colour) 40%, transparent);
	}

	.enum-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.select-arrow {
		position: absolute;
		right: 14px;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		color: var(--text-colour);
		opacity: 0.6;
		font-size: 12px;
	}

	.select-arrow::after {
		content: "▼";
	}
</style>