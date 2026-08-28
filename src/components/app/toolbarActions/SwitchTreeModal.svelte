<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { IconSitemap, IconCheck } from "@tabler/icons-svelte-runes";
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import { modals } from "$modalStore";
	import { toasts } from "$toastStore";
	import { getActiveTree } from "$treeStore";

	export let activeTreeId: string = "";

	let trees: Array<{
		id: string;
		name: string;
		active_tree: number;
		updated_at: string;
	}> = [];

	$: if ($modals.switchTree) {
		fetchTrees();
	}

	async function fetchTrees() {
		try {
			trees = await invoke("get_all_trees");
		} catch (error) {
			console.error("Failed to load trees:", error);
		}
	}

	async function handleSelectTree(treeId: string) {
		if (treeId === String(getActiveTree()?.id)) {
			handleClose();
			toasts.info(`'${getActiveTree()?.name}' family tree was already switched to.`);
			return;
		}

		try {
			await invoke("switch_active_tree", { treeId });
			handleClose();
			toasts.success(`Switched to '${getActiveTree()?.name}' family tree.`);
		} catch (error) {
			console.error("Failed to switch active tree:", error);
		}
	}

	function handleClose() {
		modals.close("switchTree");
	}

	function formatDate(dateString: string) {
		if (!dateString) return "Unknown date";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	}
</script>

<Modal isOpen={$modals.switchTree} width="90%" onClose={handleClose}>
	<svelte:fragment slot="header">
		<h2>Switch Family Tree</h2>
		<p class="subtitle">
			Select the family tree you would like to view or edit:
		</p>
	</svelte:fragment>

	<div class="tree-grid">
		{#each trees as tree}
			<button
				type="button"
				class="tree-card"
				class:active={tree.id === activeTreeId ||
					tree.active_tree === 1}
				on:click={() => handleSelectTree(tree.id)}
			>
				<div class="tree-card-header">
					<div class="icon-wrapper">
						<IconSitemap size={28} />
					</div>
					{#if tree.id === activeTreeId || tree.active_tree === 1}
						<span class="badge">
							<IconCheck size={16} /> Active
						</span>
					{/if}
				</div>

				<div class="tree-card-body">
					<span class="tree-name">{tree.name}</span>
					<span class="tree-date"
						>Last updated: {formatDate(tree.updated_at)}</span
					>
				</div>
			</button>
		{:else}
			<div class="empty-state">
				<p class="empty-text">Loading trees...</p>
			</div>
		{/each}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" type="button" on:click={handleClose}>
			Cancel
		</Button>
	</svelte:fragment>
</Modal>

<style>
	h2 {
		margin: 0;
		font-size: var(--font-xlarge);
		font-weight: 700;
		color: var(--text-colour);
	}

	.subtitle {
		margin: 0;
		font-size: var(--font-medium);
		color: var(--text-colour);
		opacity: 0.8;
	}

	.tree-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.9rem;
		width: 100%;
		max-height: 60vh;
		overflow-y: auto;
		padding: 0.25rem;
	}

	.tree-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		background: color-mix(in srgb, var(--secondary-background) 80%, var(--black));
		border: 2px solid var(--primary-colour);
		border-radius: 12px;
		cursor: pointer;
		text-align: left;
		transition:
			transform var(--xshort-transition-duration) ease,
			border-color var(--xshort-transition-duration) ease,
			box-shadow var(--xshort-transition-duration) ease;
	}

	.tree-card:hover {
		border-color: var(--primary-colour);
		background: color-mix(
			in srgb,
			var(--primary-colour) 8%,
			var(--secondary-background)
		);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.tree-card.active {
		border-color: var(--primary-colour);
		background: color-mix(
			in srgb,
			var(--primary-colour) 15%,
			var(--secondary-background)
		);
		box-shadow: 0 4px 12px
			color-mix(in srgb, var(--primary-colour) 20%, transparent);
	}

	.tree-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--secondary-colour) 50%, transparent);
		color: var(--text-colour);
		padding: 0.5rem;
		border-radius: 8px;
	}

	.tree-card.active .icon-wrapper {
		background: var(--primary-colour);
		color: var(--secondary-background);
	}

	.tree-card-body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.tree-name {
		font-size: var(--font-large, 1.25rem);
		font-weight: 600;
		color: var(--text-colour);
		word-break: break-word;
	}

	.tree-date {
		font-size: var(--font-small);
		color: var(--text-colour);
		opacity: 0.7;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--font-small);
		font-weight: 700;
		background: var(--primary-colour);
		color: var(--secondary-background);
		padding: 4px 10px;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem 0;
	}

	.empty-text {
		font-size: var(--font-medium);
		opacity: 0.6;
		margin: 0;
	}
</style>
