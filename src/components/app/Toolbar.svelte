<script lang="ts">
	import {
		IconPlus,
		IconZoomIn,
		IconZoomOut,
		IconChevronUp,
		IconUserPlus,
		IconTree,
		IconSettings,
		IconEdit,
		IconTrash,
	} from "@tabler/icons-svelte-runes";
	import Button from "$components/ui/Button.svelte";
	import { zoomIn, zoomOut } from "$networkStore";
	import { fade } from "svelte/transition";
	import CreateTree from "$components/app/toolbarActions/CreateTree.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import Person from "$components/app/person/Person.svelte";
	import Popup from "$components/app/Popup.svelte";
	import Card from "$components/ui/Card.svelte";
	import { activeTree } from "$treeStore";
	import { invoke } from "@tauri-apps/api/core";
	import RenameTreeTitle from "$components/app/toolbarActions/RenameTreeTitle.svelte";
	import SwitchTreeModal from "$components/app/toolbarActions/SwitchTreeModal.svelte";
	import { modals } from "$modalStore";
	import { type ToolbarItem, leftItems, rightItems } from "$lib/Toolbar";
	import DeleteTreeConfirm from "$components/app/toolbarActions/DeleteTreeConfirm.svelte";

	let CreateTree_first_time: boolean = false;

	let openDropup: string | null = null;

	function handleClick(item: ToolbarItem) {
		if (item.submenu) {
			openDropup = openDropup === item.id ? null : item.id;
		} else if (item.action) {
			item.action();
			openDropup = null;
		}
	}

	function handleSubmenuClick(item: ToolbarItem) {
		if (item.action) {
			item.action();
		}
		openDropup = null;
	}

	async function handleTreeDeletion() {
		const tree_id = $activeTree?.id;

		try {
			await invoke("delete_tree", { treeId: tree_id });
			await invoke("set_new_active_tree");
		} catch (error) {
			console.error("Error deleting tree:", error);
		}
	}

	function closeDropup() {
		openDropup = null;
	}
</script>

<CreateTree
	firstTime={CreateTree_first_time}
/>

<Person />

<RenameTreeTitle />

<SwitchTreeModal />

<DeleteTreeConfirm />

<div class="toolbar">
	<div class="toolbar-left">
		{#each leftItems as item (item.id)}
			<div class="toolbar-item">
				<Tooltip text={item.tooltip} position="bottom">
					<Button
						variant={item.submenu ? "secondary" : "primary"}
						on:click={() => handleClick(item)}
						ariaLabel={item.label}
					>
						<svelte:component this={item.icon} size={28} />
						{item.label}
						{#if item.submenu}
							<IconChevronUp
								size={24}
								class={openDropup === item.id
									? "chevron open"
									: "chevron"}
							/>
						{/if}
					</Button>
				</Tooltip>

				{#if item.submenu && openDropup === item.id}
					<div class="dropup" transition:fade={{ duration: 150 }}>
						{#each item.submenu as subitem (subitem.id)}
							<Tooltip text={subitem.tooltip} position="right">
								<button
									class="dropup-item"
									on:click={() => handleSubmenuClick(subitem)}
								>
									<svelte:component
										this={subitem.icon}
										size={28}
									/>
									<span>{subitem.label}</span>
								</button>
							</Tooltip>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="toolbar-right">
		{#each rightItems as item (item.id)}
			<div class="toolbar-item">
				<Tooltip text={item.tooltip} position="bottom">
					<Button
						variant="primary"
						on:click={() => handleClick(item)}
						ariaLabel={item.label}
					>
						<svelte:component this={item.icon} size={28} />
						{item.label}
					</Button>
				</Tooltip>
			</div>
		{/each}
	</div>
</div>

{#if openDropup}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" on:click={closeDropup}></div>
{/if}

<style>
	.toolbar {
		display: flex;
		align-items: center;
		gap: 24px;
		background: var(--secondary-background);
		border: 1px solid var(--border-colour);
		border-radius: 12px;
		padding: 14px 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		width: fit-content;
	}

	.toolbar-left {
		display: flex;
		gap: 14px;
	}

	.toolbar-right {
		display: flex;
		gap: 14px;
		margin-left: auto;
		padding-left: 24px;
		border-left: 1px solid var(--border-colour);
		flex: 1;
	}

	.toolbar-item {
		position: relative;
	}

	:global(.toolbar-item .chevron) {
		transition: transform 0.5s ease;
		margin-left: 4px;
	}

	:global(.toolbar-item .chevron.open) {
		transform: rotate(180deg);
	}

	.dropup {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 0;
		background: var(--secondary-background);
		border: 1.5px solid var(--border-colour);
		border-radius: 8px;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
		min-width: 240px;
		z-index: 1000;
		overflow: hidden;
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
		pointer-events: none;
	}

	.toolbar-item:has(:not(.open)) .dropup {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.dropup-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: transparent;
		border: none;
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.dropup-item:hover {
		background: color-mix(in srgb, var(--primary-colour) 15%, transparent);
	}

	.dropup-item:active {
		background: color-mix(in srgb, var(--primary-colour) 25%, transparent);
	}

	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 998;
	}
</style>