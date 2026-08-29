<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Input from "$components/ui/Input.svelte";
	import Button from "$components/ui/Button.svelte";
	import { activeTree } from "$treeStore";
	import { invoke } from "@tauri-apps/api/core";
	import { modals } from "$modalStore";
	import { toasts } from "$toastStore";

	let treeName = $state("");
	let error = $state("");

	$effect(() => {
		if ($modals.renameTree) {
			treeName = $activeTree?.name || "";
			error = "";
		}
	});

	function handleClose() {
		modals.close("renameTree");
	}

	function executeSubmit() {
		const newTreeName = treeName.trim();
		if (!newTreeName || newTreeName === $activeTree?.name) return;

		try {
			invoke("set_tree_name", {
				treeName: newTreeName,
			})
				.then(() => {
					handleClose();
					toasts.success("Tree renamed successfully!");
				})
				.catch((err) => {
					console.error("Error renaming tree:", err);
					error = "Failed to rename tree.";
					toasts.error("Failed to rename tree.");
				});
		} catch (err) {
			console.error("Error renaming tree:", err);
			error = "Failed to rename tree.";
		}
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		executeSubmit();
	}
</script>

<Modal isOpen={$modals.renameTree} width="420px" padding="medium" onClose={handleClose}>
	{#snippet header()}
		<h2>Rename "{treeName}"</h2>
	{/snippet}

	<form id="rename-tree-form" class="modal-form" onsubmit={handleSubmit}>
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

	{#snippet footer()}
		<Button
			variant="secondary"
			type="button"
			onclick={handleClose}
		>
			Cancel
		</Button>
		<Button
			variant="primary"
			type="submit"
			form="rename-tree-form"
			disabled={!treeName.trim() || treeName === $activeTree?.name}
		>
			Save
		</Button>
	{/snippet}
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