<script lang="ts">
	import Card from "$components/ui/Card.svelte";
	import Popup from "$components/app/Popup.svelte";
	import Close from "$components/ui/Close.svelte";
	import Button from "$components/ui/Button.svelte";
	import PersonOverview from "$components/app/person/PersonOverview.svelte";
	import PersonUpload from "$components/app/person/PersonUpload.svelte";
	import PersonRelationships from "$components/app/person/PersonRelationships.svelte";
	import PersonTimelines from "$components/app/person/PersonTimelines.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { hasPersonChanged, resetPersonData } from "$stores";

	export let isOpen: boolean = false;

	let activeTab: string = "overview";
	let confirmDiscard: boolean = false;

	function handlePersonDiscard() {
		const hasPersonDataChanged = hasPersonChanged();

		if (hasPersonDataChanged) {
			confirmDiscard = true;
		} else {
			isOpen = false;
		}
	}

	function handleDiscard() {
		resetPersonData();
		confirmDiscard = false;
		setTimeout(() => {
			isOpen = false;
		}, 300);
	}
</script>

<Popup bind:isOpen closeOnBackdrop={true}>
	<Card width="100%" padding="small">
		<Close onClick={() => (isOpen = false)} />

		<div class="modal-header">
			<h1>Add new family member</h1>
		</div>

		<div class="tabs">
			<Tooltip
				text="The basic details of the person like name and birth date."
				position="top"
			>
				<button
					class:active={activeTab === "overview"}
					on:click={() => (activeTab = "overview")}>Overview</button
				>
			</Tooltip>
			<Tooltip
				text="Add photos, documents, or other files for this person."
				position="top"
			>
				<button
					class:active={activeTab === "upload"}
					on:click={() => (activeTab = "upload")}>Upload</button
				>
			</Tooltip>
			<Tooltip
				text="Connect this person to parents, partners, or children."
				position="top"
			>
				<button
					class:active={activeTab === "relationships"}
					on:click={() => (activeTab = "relationships")}
					>Relationships</button
				>
			</Tooltip>
			<Tooltip
				text="Track work history, education, and life events over time."
				position="top"
			>
				<button
					class:active={activeTab === "timelines"}
					on:click={() => (activeTab = "timelines")}>Timelines</button
				>
			</Tooltip>
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
			<Tooltip
				text="Save this person and return to your family tree."
				position="top"
			>
				<Button>Save</Button>
			</Tooltip>
			<Tooltip
				text="Discard this person, deleting any progress and returning to your family tree."
				position="top"
			>
				<Button variant="secondary" on:click={handlePersonDiscard}
					>Discard</Button
				>
			</Tooltip>
		</div>
	</Card>
</Popup>

<Popup bind:isOpen={confirmDiscard} closeOnBackdrop={true}>
	<Card width="50%" padding="small">
		<Close onClick={() => (confirmDiscard = false)} />

		<div class="confirm-header">
			<h2>Discard Changes?</h2>
		</div>

		<p class="confirm-message">
			You have unsaved changes. Are you sure you want to discard this
			person?
		</p>

		<div class="confirm-footer">
			<Button
				variant="secondary"
				on:click={() => (confirmDiscard = false)}
				>No, continue editing</Button
			>
			<Button on:click={handleDiscard}>Yes, discard</Button>
		</div>
	</Card>
</Popup>

<style>
	.modal-header {
		margin-bottom: 24px;
		width: 100%;
	}

	.modal-header h1 {
		font-size: var(--font-xlarge);
		margin: 0;
		color: var(--text-colour);
		text-align: center;
	}

	.tabs {
		display: flex;
		margin-bottom: 32px;
		width: 100%;
		border: 1px solid var(--border-colour);
		border-radius: 8px;
		overflow: hidden;
	}

	.tabs button {
		flex: 1;
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-right: 1px solid var(--border-colour);
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		opacity: 0.7;
		text-align: center;
	}

	.tabs button:last-child {
		border-right: none;
	}

	.tabs button:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--primary-colour) 10%, transparent);
	}

	.tabs button.active {
		color: var(--text-colour);
		opacity: 1;
		background: color-mix(in srgb, var(--primary-colour) 20%, transparent);
		font-weight: bold;
	}

	.tab-content {
		min-height: 400px;
		margin-bottom: 24px;
		width: 100%;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding-top: 24px;
		width: 100%;
	}

	.confirm-header {
		width: 100%;
		margin-bottom: 16px;
	}

	.confirm-header h2 {
		font-size: var(--font-large);
		margin: 0;
		color: var(--text-colour);
		text-align: center;
	}

	.confirm-message {
		color: var(--text-colour);
		opacity: 0.8;
		text-align: center;
		margin-bottom: 24px;
		font-size: var(--font-medium);
	}

	.confirm-footer {
		display: flex;
		gap: 12px;
		justify-content: center;
		width: 100%;
	}
</style>
