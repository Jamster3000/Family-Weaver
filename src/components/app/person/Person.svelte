<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
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
	import { selectedPersonStore } from "$personTreeStore";
	import type { Person } from "$personTreeStore";
	import { updatePersonTreeData } from "$personTreeStore";
	import { activeTree } from "$treeStore";
	import { modals } from "$modalStore";
	import { invoke } from "@tauri-apps/api/core";
	import { toasts } from "$toastStore";
	import { getAnimationDuration } from "$lib/animationUtils";
	import { createLogger } from "$lib/logger";

	let activeTab = $state("overview");
	let isAddingTimelineEvent = $state(false);
	const selectedPerson = $derived($selectedPersonStore);

	const logger = createLogger("Person.svelte");

	let mode = $state<"create" | "edit" | "view">("create");

	$effect(() => {
		const data = modals.getData("addPerson");
		if (data?.mode) {
			mode = data.mode;
		} else {
			mode = "create";
		}
	});

	$effect(() => {
		if (isAddingTimelineEvent) {
			modals.open("timelineEntry");
		} else {
			modals.close("timelineEntry");
		}
	});

	let hasChanges = $derived($personData ? hasPersonChanged() : false);

	function handlePersonSave() {
		const rawData = $personData;
		const hasRelationships = Boolean(
			(rawData?.parentIds && rawData.parentIds.length > 0) ||
			(rawData?.partnerIds && rawData.partnerIds.length > 0) ||
			(rawData?.childrenIds && rawData.childrenIds.length > 0)
		);

		if (!hasRelationships) {
			modals.open("confirmSavePerson");
			return;
		}

		executePersonSave();
	}

	async function executePersonSave() {
		logger.info("Starting saving person");
		modals.close("confirmSavePerson");

		const rawData = $personData;
		const currentTreeId = $activeTree?.id ? String($activeTree.id) : "";

		const cleanedPerson: Person = {
			...rawData,
			firstName: rawData.firstName.trim(),
			middleNames: rawData.middleNames.trim(),
			lastName: rawData.lastName.trim(),
			gender: rawData.gender.trim(),
			birthLocation: rawData.birthLocation.trim(),
			deathLocation: rawData.deathLocation.trim(),
			importantNotes: rawData.importantNotes.trim(),
			id: selectedPerson?.id || crypto.randomUUID(),
			treeId: currentTreeId,
			tree_id: currentTreeId,
		};

		const debugString = Object.entries(rawData)
			.map(
				([key, val]) =>
					`${key}: ${typeof val === "object" && val !== null ? JSON.stringify(val) : val}`,
			)
			.join(", ");

		logger.info(`Raw Data -> ${debugString}`);

		try {
			await invoke("create_person", { person: cleanedPerson });
			updatePersonTreeData(cleanedPerson);
			resetPersonData();
			toasts.success("Person created successfully!");
			activeTab = "overview";
		} catch (error) {
			toasts.error("Failed to create person.");
			logger.error(`Error creating person: ${error}`);
			activeTab = "overview";
			return;
		}

		modals.close("addPerson");
	}

	function handleConfirmSavePersonClose() {
		modals.close("confirmSavePerson");
		activeTab = "relationships";
	}

	function handlePersonDiscard() {
		if (hasPersonChanged()) {
			modals.open("discardPersonChanges");
		} else {
			modals.close("addPerson");
			activeTab = "overview";
		}
	}

	function handleDiscard() {
		resetPersonData();
		modals.close("discardPersonChanges");
		setTimeout(() => {
			modals.close("addPerson");
			activeTab = "overview";
		}, 100);
	}

	function handleAddPersonClose() {
		modals.close("addPerson");
		activeTab = "overview";
	}

	function handleDiscardChangesClose() {
		modals.close("discardPersonChanges");
		activeTab = "overview";
	}
</script>

<Modal
	isOpen={$modals.addPerson}
	width="100%"
	padding="medium"
	onClose={handleAddPersonClose}
	showClose={true}>
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
				onclick={() => (activeTab = "overview")}>Overview</button
			>
		</Tooltip>
		<Tooltip
			text="Add photos, documents, or other files for this person."
			position="top"
		>
			<button
				class:active={activeTab === "media"}
				onclick={() => (activeTab = "media")}>Media</button
			>
		</Tooltip>
		<Tooltip
			text="Connect this person to parents, partners, or children."
			position="top"
		>
			<button
				class:active={activeTab === "relationships"}
				onclick={() => (activeTab = "relationships")}
				>Relationships</button
			>
		</Tooltip>
		<Tooltip
			text="Track work history, education, and life events over time."
			position="top"
		>
			<button
				class:active={activeTab === "timelines"}
				onclick={() => (activeTab = "timelines")}>Timelines</button
			>
		</Tooltip>
	</div>

	<div class="tab-content">
		{#key activeTab}
			<div
				in:fade={{ duration: getAnimationDuration() }}
				class="tab-panel"
			>
				{#if activeTab === "overview"}
					<PersonOverview />
				{:else if activeTab === "media"}
					<PersonMedia />
				{:else if activeTab === "relationships"}
					<PersonRelationships />
				{:else if activeTab === "timelines"}
					<PersonTimelines
						isAddingEntry={isAddingTimelineEvent}
					/>
				{/if}
			</div>
		{/key}
	</div>

	{#snippet footer()}
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
				<Button onclick={handlePersonSave}>Save</Button>
			</Tooltip>
		{/if}
		<Tooltip
			text="Discard this person, deleting any progress and returning to your family tree."
			position="top"
		>
			<Button variant="secondary" onclick={handlePersonDiscard}
				>Discard</Button
			>
		</Tooltip>
	{/snippet}
</Modal>

<ConfirmModal
	isOpen={$modals.discardPersonChanges}
	width="50%"
	title="Discard Changes?"
	message="You have unsaved changes. Are you sure you want to discard this person?"
	confirmLabel="Yes, discard"
	cancelLabel="No, continue editing"
	onConfirm={handleDiscard}
	onClose={handleDiscardChangesClose}/>

<ConfirmModal
	isOpen={$modals.confirmSavePerson}
	width="50%"
	title="No Relationships Added"
	message="This person is not connected to any parents, partners, or children. Are you sure you want to save them unlinked?"
	confirmLabel="Yes, save person"
	cancelLabel="No, add relationships"
	onConfirm={executePersonSave}
	onClose={handleConfirmSavePersonClose}/>

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
		padding-left: 5px;
		padding-right: 5px;
	}
</style>