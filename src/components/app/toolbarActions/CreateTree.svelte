<script lang="ts">
	import { IconTree } from "@tabler/icons-svelte-runes";
	import Modal from "$components/ui/Modal.svelte";
	import Input from "$components/ui/Input.svelte";
	import Button from "$components/ui/Button.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { goto } from "$app/navigation";
	import { setActiveTree, activeTree, type Tree } from "$treeStore";
	import { modals, createTreeModal } from "$modalStore";
	import { toasts } from "$toastStore";

	let tree_name: string = "";

	// Automatically true if no active tree exists in store
	$: isFirstTime = !$activeTree;

	function handleClose() {
		tree_name = "";
		modals.close("createTree");
	}

	async function handleSubmit() {
		try {
			const result = await invoke<Tree>("create_tree", {
				tree: {
					name: tree_name,
					active_tree: true,
				},
			});
			if (result) {
				setActiveTree(result);
				handleClose();
				goto("/tree");

				toasts.success(`Family tree '${tree_name}' created successfully!`);
			}
		} catch (error) {
			console.error("Error creating family tree:", error);
			toasts.error("Failed to create family tree.");
		}
	}
</script>

<Modal
	isOpen={$createTreeModal}
	width="70%"
	onClose={handleClose}
	showClose={!isFirstTime}
	closeOnBackdrop={!isFirstTime}
>
	<svelte:fragment slot="header">
		<IconTree size={42} /> {isFirstTime ? "Welcome to Family Weaver" : "Create New Family Tree"}
	</svelte:fragment>

	{#if isFirstTime}
		<p>
			Family Weaver helps you build and visualize your family tree.
			Add members, track relationships, and explore your genealogy—all
			offline, no limits.
		</p>

		<p>Let's create your first family tree to get started.</p>
	{:else}
		<p>
			You already have a family tree. Creating a new one will switch
			your active tree.
		</p>

		<div class="tree-reassured">
			<p>
				Your current tree is already saved and will not be lost. You
				will be switched to the new tree you create but can switch
				back at any time.
			</p>
		</div>
	{/if}

	<p>
		Tip: Use a surname or your home person's name (e.g., "Smith Family Tree")
	</p>

	<form class="form" on:submit|preventDefault={handleSubmit}>
		<Input
			placeholder="Enter a name for your family tree"
			bind:value={tree_name}
			centerPlaceholder={true}
		/>
		<Button type="submit">Create Family Tree</Button>
	</form>

	<svelte:fragment slot="footer">
	</svelte:fragment>
</Modal>

<style>
	.tree-reassured {
		background: color-mix(in srgb, var(--primary-colour) 10%, transparent);
		border-left: 3px solid var(--primary-colour);
		padding: 12px;
		border-radius: 4px;
		margin: 12px 0;
	}

	.tree-reassured p {
		font-size: var(--font-small);
		opacity: 0.8;
	}

	.form {
		margin-top: 12px;
	}
</style>