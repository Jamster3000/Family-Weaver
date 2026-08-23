<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Input from "$components/ui/Input.svelte";
	import Button from "$components/ui/Button.svelte";
	import { activeTree } from "$treeStore";
	import { invoke } from "@tauri-apps/api/core";
	import { modals, renameTreeModal } from "$modalStore";

	let treeName: string = "";
	let error: string = "";

	$: if ($renameTreeModal) {
		treeName = $activeTree?.name || "";
		error = "";
	}

	function handleClose() {
		modals.close("renameTree");
	}

	function handleSubmit() {
		const newTreeName = treeName.trim();

		try {
			invoke("set_tree_name", {
				treeName: newTreeName,
			})
				.then(() => {
					handleClose();
				})
				.catch((err) => {
					console.error("Error renaming tree:", err);
					error = "Failed to rename tree. Please try again.";
				});
		} catch (err) {
			console.error("Error renaming tree:", err);
			error = "Failed to rename tree. Please try again.";
		}
	}
</script>

<Modal isOpen={$renameTreeModal} width="420px" padding="medium" onClose={handleClose}>
	<svelte:fragment slot="header">
		<h2>Rename Active Tree</h2>
	</svelte:fragment>

	<form class="modal-form" on:submit|preventDefault={handleSubmit}>
		<div class="input-container">
			<Input
				label="Tree Name"
				placeholder="Enter new tree name..."
				bind:value={treeName}
				{error}
				centerPlaceholder={true}
			/>
		</div>
	</form>

	<svelte:fragment slot="footer">
		<Button
			variant="secondary"
			type="button"
			on:click={handleClose}
		>
			Cancel
		</Button>
		<Button
			variant="primary"
			type="submit"
			disabled={!treeName.trim() ||
				treeName === $activeTree?.name}
			on:click={handleSubmit}
		>
			Save
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.modal-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
	}

	h2 {
		margin: 0;
		font-size: var(--font-large);
		font-weight: 600;
		color: var(--text-colour);
		text-align: center;
	}

	.input-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.input-container :global(.field) {
		align-items: center;
		text-align: center;
	}

	.input-container :global(.input-wrap) {
		width: 100% !important;
	}
</style>