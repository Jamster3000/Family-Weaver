<script lang="ts">
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
	import { modals } from "$modalStore";
	import { selectedPersonStore, type SelectedPerson as SelectedPersonType } from "$personTreeStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";
	import { createLogger } from "$lib/logger";

	const logger = createLogger("DeletePersonConfirm.svelte");

	const selectedPerson: SelectedPersonType = $derived($selectedPersonStore);

	async function handlePersonDeletion() {
		logger.info(`Attempting to delete person with ID: ${selectedPerson.id}`);

		try {
			await invoke("delete_person", { personId: selectedPerson.id, treeId: selectedPerson.treeId });
			toasts.success(`Person "${selectedPerson.name}" deleted successfully!`);
			logger.info(`Person "${selectedPerson.name}" deleted successfully.`);
		} catch (error) {
			console.error("Error deleting person:", error);
			toasts.error(`Failed to delete person "${selectedPerson.name}".`);
			logger.error(`Failed to delete person with ID: ${selectedPerson.id}. Error: ${error}`);
		} finally {
			handleClose();
		}
	}

	function handleClose() {
		modals.close("deletePersonConfirm");
	}
</script>

<ConfirmModal
	isOpen={$modals.deletePersonConfirm}
	title={`Delete "${selectedPerson.name}"?`}
	message="Are you sure you want to delete this person? This action cannot be undone."
	confirmLabel="Delete"
	cancelLabel="Cancel"
	onConfirm={handlePersonDeletion}
	onClose={handleClose}
/>