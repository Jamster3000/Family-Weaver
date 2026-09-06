<script lang="ts">
	import { onMount } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { personTreeStore, type Person } from "$personTreeStore";
	import { FamilyTreeLayout } from "$lib/treeLayout/index";

	let container = $state<HTMLDivElement | null>(null);
	let layoutInstance = $state<FamilyTreeLayout | null>(null);

	onMount(() => {
		(async () => {
			try {
				const people = await invoke<Person[]>("get_all_people");
				personTreeStore.set(people);
			} catch (err) {
				console.error("Failed to fetch people:", err);
			}
		})();

		if (container) {
			layoutInstance = new FamilyTreeLayout(container, {
				toolbarSelector: ".toolbar", //passing this class means the tree scale takes into account the toolbar existance
			});
		}

		return () => {
			if (layoutInstance) {
				layoutInstance.destroy();
			}
		};
	});

	$effect(() => {
		if (layoutInstance && $personTreeStore.length > 0) {
			layoutInstance.render($personTreeStore);
		}
	});
</script>

<div class="tree-wrapper">
	<div class="network-container" bind:this={container}></div>
</div>

<style>
	.tree-wrapper {
		position: relative;
		width: 100%;
		height: calc(100vh - 35px);
		overflow: hidden;
		background: var(--primary-background, #1a1d24);
	}

	.network-container {
		width: 100%;
		height: 100%;
	}
</style>
