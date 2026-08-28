<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import { modals, deleteTreeConfirmModal } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { activeTree, setActiveTree, type Tree } from "$treeStore";
	import { toasts } from "$toastStore";

	async function handleTreeDeletion() {
		const tree_id = $activeTree?.id;

		try {
			await invoke("delete_tree", { treeId: tree_id });
			const tree: Tree = await invoke("set_new_active_tree");

			setActiveTree(tree);
			handleClose();

			toasts.success("Tree deleted successfully!");
			toasts.success(`Switching to ${tree.name}`);
		} catch (error) {
			console.error("Error deleting tree:", error);

			handleClose();

			toasts.error("Failed to delete tree.");
		}
	}

	function handleClose() {
		modals.close("deleteTreeConfirm");
	}

	function handleDelete() {
		handleTreeDeletion();
	}
</script>

<Modal isOpen={$deleteTreeConfirmModal} width="40%" padding="small" onClose={handleClose}>
	<svelte:fragment slot="header">
		<h2>Delete "{ $activeTree?.name }"?</h2>
	</svelte:fragment>
	<p class="confirm-message">
		Are you sure you want to delete this tree? This will also delete all
		people associated with this tree. This action cannot be undone.
	</p>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={handleClose}>
			Cancel
		</Button>
		<Button on:click={handleDelete}>
			Delete
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.confirm-message {
		color: var(--text-colour);
		opacity: 0.9;
		text-align: center;
		margin: 0 0 24px 0;
		font-size: var(--font-medium);
	}
</style>