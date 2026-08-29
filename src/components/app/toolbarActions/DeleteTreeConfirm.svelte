<script lang="ts">
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
	import { modals } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { activeTree, setActiveTree, type Tree } from "$treeStore";
	import { toasts } from "$toastStore";
	import { createLogger } from "$lib/logger";

	const logger = createLogger("DeleteTreeConfirm.svelte");

	async function handleTreeDeletion() {
		const tree_id = $activeTree?.id;

		logger.info(`Attempting to delete tree with ID: ${tree_id}`);

		try {
			await invoke("delete_tree", { treeId: tree_id });
			const tree: Tree = await invoke("set_new_active_tree");

			setActiveTree(tree);
			handleClose();
			toasts.success("Tree deleted successfully!");
			toasts.success(`Switching to ${tree.name}`);
			logger.info(`Tree deleted successfully. New active tree: ${tree.name}`);
		} catch (error) {
			console.error("Error deleting tree:", error);
			handleClose();
			toasts.error("Failed to delete tree.");
			logger.error(`Failed to delete tree with ID: ${tree_id}. Error: ${error}`);
		}
	}

	function handleClose() {
		modals.close("deleteTreeConfirm");
	}
</script>

<ConfirmModal
	isOpen={$modals.deleteTreeConfirm}
	title={`Delete "${$activeTree?.name}"?`}
	message="Are you sure you want to delete this tree? This will also delete all people associated with this tree. This action cannot be undone."
	confirmLabel="Delete"
	cancelLabel="Cancel"
	onConfirm={handleTreeDeletion}
	onClose={handleClose}
/>