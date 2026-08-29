<script lang="ts">
	import type { Settings } from "$settingsStore";
	import Button from "$components/ui/Button.svelte";
	import { IconTrash } from "@tabler/icons-svelte-runes";
	import DeleteAllData from "$components/app/toolbarActions/settings/actions/DeleteAllData.svelte";
	import { modals } from "$modalStore";

	let {
		setting
	}: {
		setting?: Settings;
	} = $props();

	function handleAction() {
		if (setting?.key === "delete_all_data") {
			modals.open("deleteTreeConfirm");
		}
	}

	function getActionButton() {
		if (setting?.key === "delete_all_data") {
			return {
				label: "Delete All Data",
				variant: "primary" as const,
				icon: IconTrash,
			};
		}
		return {
			label: "Execute",
			variant: "primary" as const,
			icon: null,
		};
	}

	let actionConfig = $derived(getActionButton());
	let ActionIcon = $derived(actionConfig.icon);
</script>

<DeleteAllData />

<Button
	variant={actionConfig.variant}
	onclick={handleAction}
	ariaLabel={actionConfig.label}
>
	{#if ActionIcon}
		<ActionIcon size={20} />
	{/if}
	<span>{actionConfig.label}</span>
</Button>