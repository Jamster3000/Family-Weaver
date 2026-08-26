<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import PersonOverview from "$components/app/person/PersonOverview.svelte";
	import PersonMedia from "$components/app/person/PersonMedia.svelte";
	import PersonRelationships from "$components/app/person/PersonRelationships.svelte";
	import PersonTimelines from "$components/app/person/PersonTimelines.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { fade } from "svelte/transition";
	import {
		personData,
		hasPersonChanged,
		resetPersonData,
	} from "$personStore";
	import { activeTree } from "$treeStore";
	import { modals, timelineEntryModal, addPersonModal, discardPersonChangesModal } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";
	import { getAnimationDuration } from "$lib/animationUtils";

	let activeTab: string = "overview";

	let isAddingTimelineEvent = false;

	$: isAddingTimelineEvent, updateTimelineModal();

	function updateTimelineModal() {
		if (isAddingTimelineEvent) {
			modals.open("timelineEntry");
		} else {
			modals.close("timelineEntry");
		}
	}

	$: hasChanges = $personData ? hasPersonChanged() : false;

	async function handlePersonSave() {
		const rawData = $personData;

		const cleanedPerson = {
			...rawData,
			firstName: rawData.firstName.trim(),
			middleNames: rawData.middleNames.trim(),
			lastName: rawData.lastName.trim(),
			birthLocation: rawData.birthLocation.trim(),
			deathLocation: rawData.deathLocation.trim(),
			importantNotes: rawData.importantNotes.trim(),
			id: crypto.randomUUID(),
			tree_id: $activeTree?.id,
		};

		try {
			let createdPerson = await invoke("create_person", {
				person: cleanedPerson
			});
			resetPersonData();
			toasts.success("Person created successfully!");
		} catch(error) {
			toasts.error("Failed to create person.");
			return;
		}

		modals.close("addPerson");
	}

	function handlePersonDiscard() {
		const hasPersonDataChanged = hasPersonChanged();

		if (hasPersonDataChanged) {
			modals.open("discardPersonChanges");
		} else {
			modals.close("addPerson");
		}
	}

	function handleDiscard() {
		resetPersonData();
		modals.close("discardPersonChanges");
		setTimeout(() => {
			modals.close("addPerson");
		}, 300);
	}

	function handleAddPersonClose() {
		modals.close("addPerson");
	}

	function handleDiscardChangesClose() {
		modals.close("discardPersonChanges");
	}
</script>

<Modal isOpen={$addPersonModal} width="100%" padding="medium" onClose={handleAddPersonClose} showClose={true}>
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
				class:active={activeTab === "media"}
				on:click={() => (activeTab = "media")}>Media</button
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
		{#key activeTab}
			<div in:fade={{ duration: getAnimationDuration() }} class="tab-panel">
				{#if activeTab === "overview"}
					<PersonOverview />
				{:else if activeTab === "media"}
					<PersonMedia />
				{:else if activeTab === "relationships"}
					<PersonRelationships />
				{:else if activeTab === "timelines"}
					<PersonTimelines bind:isAddingEntry={isAddingTimelineEvent} />
				{/if}
			</div>
		{/key}
	</div>

	<svelte:fragment slot="footer">
		{#if isAddingTimelineEvent}
			<Tooltip
				text="You must finish adding the timeline event before saving this person."
				position="top"
			>
				<Button disabled={true}>Save</Button>
			</Tooltip>
		{:else if !hasChanges}
			<Tooltip
				text="Please add some information about this person before saving."
				position="top"
			>
				<Button disabled={true}>Save</Button>
			</Tooltip>
		{:else}
			<Tooltip
				text="Save this person and return to your family tree."
				position="top"
			>
				<Button on:click={handlePersonSave}>Save</Button>
			</Tooltip>
		{/if}
		<Tooltip
			text="Discard this person, deleting any progress and returning to your family tree."
			position="top"
		>
			<Button variant="secondary" on:click={handlePersonDiscard}
				>Discard</Button
			>
		</Tooltip>
	</svelte:fragment>
</Modal>

<Modal isOpen={$discardPersonChangesModal} width="50%" padding="small" onClose={handleDiscardChangesClose}>
	<svelte:fragment slot="header">
		<h2>Discard Changes?</h2>
	</svelte:fragment>

	<p class="confirm-message">
		You have unsaved changes. Are you sure you want to discard this
		person?
	</p>

	<svelte:fragment slot="footer">
		<Button
			variant="secondary"
			on:click={handleDiscardChangesClose}
			>No, continue editing</Button
		>
		<Button on:click={handleDiscard}>Yes, discard</Button>
	</svelte:fragment>
</Modal>

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
		transition: all var(--xshort-transition-duration) ease;
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
		height: 450px;
		margin-bottom: 24px;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.confirm-message {
		color: var(--text-colour);
		opacity: 0.8;
		text-align: center;
		margin-bottom: 24px;
		font-size: var(--font-medium);
	}
</style>