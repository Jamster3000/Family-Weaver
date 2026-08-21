<script lang="ts">
	import Popup from "$components/app/Popup.svelte";
	import Card from "$components/ui/Card.svelte";
	import Input from "$components/ui/Input.svelte";
	import Button from "$components/ui/Button.svelte";
	import Close from "$components/ui/Close.svelte";
	import { getActiveTree } from "$treeStore";
	import { invoke } from "@tauri-apps/api/core";

	export let isOpen: boolean = false;

	let treeName = getActiveTree()?.name || "";
	let error = "";

	$: if (isOpen) {
		treeName = getActiveTree()?.name || "";
		error = "";
	}

	function handleSubmit() {
		const newTreeName = treeName.trim();

		try {
			invoke("set_tree_name", {
				treeName: newTreeName,
			})
				.then(() => {
					isOpen = false;
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

<Popup {isOpen} onClose={() => (isOpen = false)} closeOnBackdrop={true}>
	<Card width="420px" padding="medium" center={true}>
		<Close onClick={() => (isOpen = false)} />

		<form class="modal-form" on:submit|preventDefault={handleSubmit}>
			<h2>Rename Active Tree</h2>

			<div class="input-container">
				<Input
					label="Tree Name"
					placeholder="Enter new tree name..."
					bind:value={treeName}
					{error}
					centerPlaceholder={true}
				/>
			</div>

			<div class="actions">
				<Button
					variant="secondary"
					type="button"
					on:click={() => (isOpen = false)}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					type="submit"
					disabled={!treeName.trim() ||
						treeName === getActiveTree()?.name}
				>
					Save
				</Button>
			</div>
		</form>
	</Card>
</Popup>

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

	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		width: 100%;
	}

	.actions :global(.btn) {
		width: 100%;
	}
</style>
