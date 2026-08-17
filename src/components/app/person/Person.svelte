<script lang="ts">
	import Card from "$components/ui/Card.svelte";
	import Popup from "$components/app/Popup.svelte";
	import Close from "$components/ui/Close.svelte";
	import PersonOverview from "$components/app/person/PersonOverview.svelte";
	import PersonUpload from "$components/app/person/PersonUpload.svelte";
	import PersonRelationships from "$components/app/person/PersonRelationships.svelte";
	import PersonTimelines from "$components/app/person/PersonTimelines.svelte";

	export let isOpen: boolean = false;
	let activeTab: String = "";
</script>

<Popup {isOpen} closeOnBackdrop={true}>
	<Card width="100%" padding="small">
		<Close onClick={() => (isOpen = false)} />

		<div class="modal-header">
			<h1>Add new family member</h1>
		</div>

		<div class="tabs">
			<button
				class:active={activeTab === "overview"}
				on:click={() => (activeTab = "overview")}>Overview</button
			>
			<button
				class:active={activeTab === "upload"}
				on:click={() => (activeTab = "upload")}>Upload</button
			>
			<button
				class:active={activeTab === "relationships"}
				on:click={() => (activeTab = "relationships")}
				>Relationships</button
			>
			<button
				class:active={activeTab === "timelines"}
				on:click={() => (activeTab = "timelines")}>Timelines</button
			>
		</div>

		<div class="tab-content">
			{#if activeTab === "overview"}
				<PersonOverview />
			{:else if activeTab === "upload"}
				<PersonUpload />
			{:else if activeTab === "relationships"}
				<PersonRelationships />
			{:else if activeTab === "timelines"}
				<PersonTimelines />
			{/if}
		</div>

		<div class="modal-footer">
			<button>Save</button>
			<button>Close</button>
		</div>
	</Card>
</Popup>

<style>
  .modal-header {
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border-colour);
    padding-bottom: 16px;
  }

  .modal-header h1 {
    font-size: var(--font-xlarge);
    margin: 0;
    color: var(--text-colour);
  }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border-colour);
  }

  .tabs button {
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: var(--text-colour);
    font-size: var(--font-medium);
    font-family: var(--font-primary);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    opacity: 0.6;
  }

  .tabs button:hover {
    opacity: 0.8;
  }

  .tabs button.active {
    color: var(--primary-colour);
    border-bottom-color: var(--primary-colour);
    opacity: 1;
  }

  .tab-content {
    min-height: 400px;
    margin-bottom: 24px;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--border-colour);
  }

  .modal-footer button {
    padding: 10px 20px;
    background: var(--primary-colour);
    color: var(--text-colour);
    border: none;
    border-radius: 6px;
    font-size: var(--font-medium);
    font-family: var(--font-primary);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .modal-footer button:hover {
    background: color-mix(in srgb, var(--primary-colour) 85%, black);
  }

  .modal-footer button:last-child {
    background: transparent;
    border: 1.5px solid var(--border-colour);
    color: var(--text-colour);
  }

  .modal-footer button:last-child:hover {
    background: color-mix(in srgb, var(--primary-colour) 10%, transparent);
  }
</style>