<script lang="ts">
	import { IconTree } from "@tabler/icons-svelte-runes";
	import Popup from "$components/app/Popup.svelte";
	import Card from "$components/ui/Card.svelte";
	import Input from "$components/ui/Input.svelte";
	import Button from "$components/ui/Button.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { goto } from "$app/navigation";
	import Close from "$components/ui/Close.svelte";
	import { setActiveTree } from "$treeStore";

	let tree_name: string = "";
	export let firstTime: boolean = true;
	export let open_popup: boolean = false;

	async function handleSubmit() {
		try {
			const result = await invoke("create_tree", {
				tree: {
					name: tree_name,
					active_tree: true,
				},
			});
			if (result) {
				setActiveTree(result);
				goto("/tree");
			}
		} catch (error) {
			console.error("Error creating family tree:", error);
		}
	}
</script>

<Popup isOpen={open_popup} onClose={() => (open_popup = false)}>
	<Card width="70%" center={true}>
		{#if firstTime}
			<h1><IconTree size={42} /> Welcome to Family Weaver</h1>

			<p>
				Family Weaver helps you build and visualize your family tree.
				Add members, track relationships, and explore your genealogy—all
				offline, no limits.
			</p>

			<p>Let's create your first family tree to get started.</p>
		{:else}
			<Close onClick={() => (open_popup = false)} />
			<h1><IconTree size={42} /> Create New Family Tree</h1>

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
			Tip: Use a surname or your home person's name (e.g., "Smith Family
			Tree")
		</p>

		<form class="form" on:submit|preventDefault={handleSubmit}>
			<Input
				placeholder="Enter a name for your family tree"
				bind:value={tree_name}
				centerPlaceholder={true}
			/>
			<Button type="submit">Create Family Tree</Button>
		</form>
	</Card>
</Popup>

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
</style>
