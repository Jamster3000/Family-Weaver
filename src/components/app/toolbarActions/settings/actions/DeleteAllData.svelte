<script lang="ts">
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
	import { modals } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";

	async function handleTreeDeletion() {
		try {
			await invoke("delete_all_trees");

			handleClose();
			toasts.success("All trees deleted successfully!");
			modals.close("settings");
			modals.open("createTree");
		} catch (error) {
			console.error("Error deleting all trees:", error);
			handleClose();
			toasts.error("Failed to delete all trees.");
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