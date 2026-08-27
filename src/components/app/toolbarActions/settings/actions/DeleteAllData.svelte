<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import { modals, deleteTreeConfirmModal } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";
	import CreateTree from "$components/app/toolbarActions/CreateTree.svelte";

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

	function handleDelete() {
		handleTreeDeletion();
	}
</script>

<CreateTree firstTime={true} />

<Modal isOpen={$deleteTreeConfirmModal} width="40%" padding="small" onClose={handleClose}>
	<p class="confirm-message">
		Are you sure you want to delete all trees? This will permanently delete
		every family tree, person, relationship, and timeline record in the database.
		This action cannot be undone.
	</p>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={handleClose}>
			Cancel
		</Button>
		<Button on:click={handleDelete}>
			Delete All
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