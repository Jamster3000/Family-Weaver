<script lang="ts">
	import Toggle from "$components/ui/Toggle.svelte";
	import { type Settings, updateSettings, settingsData } from "$settingsStore";
	import { applyReduceMotion, applyHighContrast, applyLineSpacing, applyLetterSpacing } from "$lib/applySettings";

	export let setting: Settings;

	$: isChecked = setting.value && "Bool" in setting.value ? setting.value.Bool : false;

	function handleChange(e: CustomEvent<boolean>) {
		const newValue = e.detail;

		updateSettings([{ key: setting.key, value: { Bool: newValue } }]);

		if (setting.key === "reduce_motion") {
			applyReduceMotion($settingsData);
		}

		if (setting.key === "high_contrast_mode") {
			applyHighContrast($settingsData);
		}

		if (setting.key === "increase_line_spacing") {
			applyLineSpacing($settingsData);
		}

		if (setting.key === "increase_letter_spacing") {
			applyLetterSpacing($settingsData);
		}
	}
</script>

<div class="settings-bool-wrapper">
	<Toggle checked={isChecked} on:change={handleChange} />
</div>

<style>
	.settings-bool-wrapper {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
</style>