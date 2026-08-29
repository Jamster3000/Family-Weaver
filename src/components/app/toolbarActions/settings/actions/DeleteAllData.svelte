<script lang="ts">
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
	import { modals } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";
	import { createLogger } from "$lib/logger";

	const logger = createLogger("DeleteAllData.svelte");

	async function handleTreeDeletion() {
		logger.info("Attempting to delete all trees...");

		try {
			await invoke("delete_all_trees");

			handleClose();
			toasts.success("All trees deleted successfully!");
			modals.close("settings");
			modals.open("createTree");
			logger.info("All trees deleted successfully.");
		} catch (error) {
			console.error("Error deleting all trees:", error);
			handleClose();
			toasts.error("Failed to delete all trees.");
			logger.error("Failed to delete all trees:", error);
		}
	}

	function handleClose() {
		modals.close("deleteTreeConfirm");
	}
</script>

<ConfirmModal
	isOpen={$modals.deleteTreeConfirm}
	title="Delete All Trees?"
	message="Are you sure you want to delete all trees? This will permanently delete every family tree, person, relationship, and timeline record in the database. This action cannot be undone."
	confirmLabel="Delete All"
	onConfirm={handleTreeDeletion}
	onClose={handleClose}
/>