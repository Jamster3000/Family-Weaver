<script lang="ts">
	import { getCurrentWindow } from "@tauri-apps/api/window";
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import { IconMinus, IconSquares, IconX } from "@tabler/icons-svelte-runes";
	import Button from "$components/ui/Button.svelte";
	import { activeTree, setActiveTree, type Tree } from "$treeStore";

	let appWindow: any;

	onMount(() => {
		let unlisten: (() => void) | undefined;

		const setup = async () => {
			appWindow = await getCurrentWindow();

			const treeData: Tree = await invoke("get_active_tree");
			setActiveTree(treeData);

			unlisten = await listen("tree-changed", (event: any) => {
				const newTree: Tree = event.payload;
				setActiveTree(newTree);
			});
		};

		setup();

		return () => {
			if (unlisten) {
				unlisten();
			}
		};
	});
</script>

<div class="titlebar" data-tauri-drag-region>
	<div class="titlebar-title" data-tauri-drag-region>
		{#if $activeTree}
			<p class="title-text">Family Weaver - {$activeTree.name}</p>
		{:else}
			<p class="title-text">Family Weaver</p>
		{/if}
	</div>

	<div class="titlebar-controls">
		<button
			class="minimise"
			type="button"
			on:click={() => appWindow.minimize()}
			aria-label="Minimise Button"
		>
			<IconMinus size={16} />
		</button>

		<button
			class="maximise"
			type="button"
			on:click={() => appWindow.toggleMaximize()}
			aria-label="Maximise Button"
		>
			<IconSquares size={16} />
		</button>

		<button
			class="close"
			type="button"
			aria-label="Close Button"
			on:click={() => appWindow.close()}
		>
			<IconX size={16} />
		</button>
	</div>
</div>

<style>
	.titlebar {
		height: var(--titlebar-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		user-select: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: var(--secondary-background);
		color: var(--text-colour);
		z-index: 100000;
	}

	.titlebar-title {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-left: 4px;
	}

	.title-text {
		padding-left: 14px;
	}

	.titlebar-controls {
		display: flex;
		gap: 4px;
		align-self: stretch;
	}

	.titlebar-controls button {
		width: 46px;
		height: 100%;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		transition: background var(--xsmall-transition-duration);
	}

	.titlebar-controls button:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.titlebar-controls button.close:hover {
		background: var(--red-error);
	}

	:root[data-theme="light"] .titlebar-controls button:not(.close):hover {
		background: rgba(200, 200, 200);
	}
</style>
