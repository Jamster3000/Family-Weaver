<script lang="ts">
	import { IconChevronUp } from "@tabler/icons-svelte-runes";
	import Button from "$components/ui/Button.svelte";
	import { zoomIn, zoomOut } from "$networkStore";
	import { fade } from "svelte/transition";
	import CreateTree from "$components/app/toolbarActions/CreateTree.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import Person from "$components/app/person/Person.svelte";
	import { activeTree } from "$treeStore";
	import RenameTreeTitle from "$components/app/toolbarActions/RenameTreeTitle.svelte";
	import SwitchTreeModal from "$components/app/toolbarActions/SwitchTreeModal.svelte";
	import DeleteTreeConfirm from "$components/app/toolbarActions/DeleteTreeConfirm.svelte";
	import Settings from "$components/app/toolbarActions/settings/SettingsModal.svelte";
	import { modals } from "$modalStore";
	import { type ToolbarItem, getLeftItems, rightItems } from "$lib/Toolbar";
	import { check, type Update } from "@tauri-apps/plugin-updater";
	import { onMount } from "svelte";
	import { updateStore } from "$lib/stores/updateStore";
	import { getAnimationDuration } from "$lib/animationUtils";

	let CreateTree_first_time: boolean = false;
	let hasUpdate: boolean = false;
	let updateAvailable: Update | null = null;
	let leftItems: ToolbarItem[] = [];

	async function checkForUpdate() {
		try {
			const update = await check();
			if (update) {
				hasUpdate = true;
				updateAvailable = update;
				leftItems = getLeftItems(true);
			} else {
				// Clear the pendingUpdate flag if no update is found
				localStorage.removeItem("pendingUpdate");
				leftItems = getLeftItems(false);
			}
		} catch (error) {
			console.error("Error checking for updates:", error);
			leftItems = getLeftItems(false);
		}
	}

	onMount(() => {
		// Subscribe to updateStore for reactive updates
		updateStore.subscribe(state => {
			hasUpdate = state.hasUpdate;
			leftItems = getLeftItems(state.hasUpdate);
		})();
	});

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

	function closeDropup() {
		openDropup = null;
	}
</script>

<CreateTree
	bind:open_popup={$modals.createTree}
	firstTime={CreateTree_first_time}
/>

<Person bind:isOpen={$modals.addPerson} />

<RenameTreeTitle />

<SwitchTreeModal />

<DeleteTreeConfirm />

<Settings />

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
					<div class="dropup" transition:fade={{ duration: getAnimationDuration() }}>
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
		transition: transform var(--small-transition-duration) ease;
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
			opacity var(--xshort-transition-duration) ease,
			transform var(--xshort-transition-duration) ease;
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
		transition: background var(--xsmall-transition-duration);
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