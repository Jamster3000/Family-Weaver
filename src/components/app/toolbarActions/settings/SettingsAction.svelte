<script lang="ts">
	import type { Settings } from "$settingsStore";
	import Button from "$components/ui/Button.svelte";
	import { IconTrash } from "@tabler/icons-svelte-runes";
	import DeleteAllData from "$components/app/toolbarActions/settings/actions/DeleteAllData.svelte";
	import { modals } from "$modalStore";

	export let setting: Settings;

	function handleAction() {
		if (setting.key === "delete_all_data") {
			modals.open("deleteTreeConfirm");
		}
	}

	function getActionButton() {
		if (setting.key === "delete_all_data") {
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

	$: actionConfig = getActionButton();
</script>

<DeleteAllData />

<Button
	variant={actionConfig.variant}
	on:click={handleAction}
	ariaLabel={actionConfig.label}
>
	{#if actionConfig.icon}
		<svelte:component this={actionConfig.icon} size={20} />
	{/if}
	<span>{actionConfig.label}</span>
</Button>