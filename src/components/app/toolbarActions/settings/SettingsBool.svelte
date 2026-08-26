<script lang="ts">
	import Toggle from "$components/ui/Toggle.svelte";
	import { type Settings, updateSettings } from "$settingsStore";
	import { applyTheme } from "$themeStore";

	export let setting: Settings;

	$: isChecked = setting.value && "Bool" in setting.value ? setting.value.Bool : false;

	function handleChange(e: CustomEvent<boolean>) {
		const newValue = e.detail;

		updateSettings([{ key: setting.key, value: { Bool: newValue } }]);

		if (setting.key === "reduce_motion") {
			document.documentElement.setAttribute(
				"data-reduce-motion",
				newValue ? "true" : "false"
			);
		}

		if (setting.key === "high_contrast_mode") {
			applyTheme();
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