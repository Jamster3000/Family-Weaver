<script lang="ts">
	import Toggle from "$components/ui/Toggle.svelte";

	export let setting: {
		key: string;
		name: string;
		short_description?: string;
		long_description?: string;
		value: boolean;
		category: string;
		value_type: string;
	};
</script>

<div class="settings-bool-wrapper">
	<Toggle bind:checked={setting.value} />
</div>

<style>
	.settings-bool-wrapper {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
</style>