<script lang="ts">
	import {
		IconPlus,
		IconZoomIn,
		IconZoomOut,
		IconChevronUp,
		IconUserPlus,
		IconTree,
		IconSettings,
	} from "@tabler/icons-svelte-runes";
	import Button from "$components/ui/Button.svelte";
	import { zoomIn, zoomOut } from "$stores";
	import { fade } from "svelte/transition";
	import Create_tree from "$components/app/Create_tree.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";

	let create_tree_first_time: boolean = false;
	let create_tree_open: boolean = false;

	interface ToolbarItem {
		id: string;
		label: string;
		tooltip: string;
		icon: any;
		action?: () => void;
		submenu?: ToolbarItem[];
	}

	const leftItems: ToolbarItem[] = [
		{
			id: "create",
			label: "Create",
			tooltip: "Create new items like a new tree or create a new person.",
			icon: IconPlus,
			submenu: [
				{
					id: "create-person",
					label: "Add Person",
					tooltip: "Add a new person to the active family tree.",
					icon: IconUserPlus,
					action: () => console.log("create person"),
				},
				{
					id: "create-tree",
					label: "New Family Tree",
					tooltip: "Create a new family tree",
					icon: IconTree,
					action: () => (create_tree_open = true),
				},
			],
		},
		{
			id: "settings",
			label: "Settings",
			tooltip: "Open settings to change application preferences.",
			icon: IconSettings,
			action: () => console.log("open settings"),
		},
	];

	const rightItems: ToolbarItem[] = [
		{
			id: "zoom-in",
			label: "Zoom In",
			tooltip: "Zoom in to the family tree.",
			icon: IconZoomIn,
			action: () => zoomIn(),
		},
		{
			id: "zoom-out",
			label: "Zoom Out",
			tooltip: "Zoom out of the family tree.",
			icon: IconZoomOut,
			action: () => zoomOut(),
		},
	];

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

<Create_tree
	bind:open_popup={create_tree_open}
	firstTime={create_tree_first_time}
/>

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
		position: fixed;
		bottom: 30px;
		left: 0;
		right: 0;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 24px;
		background: var(--secondary-background);
		border: 1px solid var(--border-colour);
		border-radius: 12px;
		padding: 14px 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 1000;
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
		transition: transform 0.2s ease;
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
		z-index: 1001;
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
		z-index: 999;
	}

	@media (max-width: 768px) {
		.toolbar {
			bottom: 10px;
			left: 10px;
			right: 10px;
			transform: none;
			flex-wrap: wrap;
			justify-content: center;
		}

		.toolbar-right {
			margin-left: 0;
			padding-left: 0;
			border-left: none;
			border-top: 1px solid var(--border-colour);
			padding-top: 12px;
			margin-top: 12px;
			width: 100%;
		}
	}
</style>
