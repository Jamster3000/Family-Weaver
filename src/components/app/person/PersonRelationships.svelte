<script lang="ts">
	import { personData, updatePersonData } from "$personStore";
	import { personTreeStore } from "$personTreeStore";
	import Button from "$components/ui/Button.svelte";
	import {
		IconUser,
		IconUsers,
		IconHeart,
		IconTrash,
	} from "@tabler/icons-svelte-runes";
	import RelationSelect from "$components/ui/RelationSelect.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";

	let { mode } = $props();

	function formatName(person: {
		firstName?: string;
		lastName?: string;
	}): string {
		const name = [person.firstName, person.lastName]
			.filter(Boolean)
			.join(" ");
		return name || "Unnamed Person";
	}

	function getRelationLabel(prefix: string): string {
		const name = formatName($personData);
		return name === "Unnamed Person" ? prefix : `${prefix} to ${name}`;
	}

	let peopleById = $derived(new Map($personTreeStore.map((p) => [p.id, p])));

	// Combine all assigned relationships so a person can't be added to multiple categories simultaneously
	let allAssignedIds = $derived([
		...($personData.parentIds || []),
		...($personData.childrenIds || []),
		...($personData.partnerIds || []),
	]);

	// Keep track of the number of available people to add to relationships
	// Used to disable elements and make it clear there is nobody to add yet
	let availablePeopleCount = $derived($personTreeStore.length);

	function handleAddRelation(
		field: "parentIds" | "childrenIds" | "partnerIds",
		selectedIds: string[],
	) {
		const currentList = $personData[field] || [];
		const newUniqueIds = selectedIds.filter(
			(id) => !currentList.includes(id),
		);
		if (newUniqueIds.length > 0) {
			updatePersonData({ [field]: [...currentList, ...newUniqueIds] });
		}
	}

	function handleRemoveRelation(
		field: "parentIds" | "childrenIds" | "partnerIds",
		idToRemove: string,
	) {
		const currentList = $personData[field] || [];
		const updatedList = currentList.filter((id) => id !== idToRemove);

		updatePersonData({
			[field]: updatedList,
		});
	}
</script>

{#if availablePeopleCount === 0}
	<div class="no-people-banner">
		<p>No other people have been added to this family tree yet.</p>
	</div>
{/if}

<div class="relationships-container">
	<div class="relation-group">
		<div class="group-header">
			<IconUser size={24} />
			<h2 class="group-title">Parents</h2>
		</div>

		<div class="group-content">
			<Tooltip text={mode === "view" ? "Click Edit to add or remove parents" : ""}>
				<RelationSelect
					placeholder="Add parent"
					relationType="parent"
					excludeIds={allAssignedIds}
					onSelect={(ids) => handleAddRelation("parentIds", ids)}
					disabled={availablePeopleCount === 0 || mode === "view"}
				/>
			</Tooltip>

			{#if $personData.parentIds.length === 0}
				<p class="empty-state">{getRelationLabel("Add parent(s)")}</p>
			{:else}
				<div class="relations-list">
					{#each $personData.parentIds as parentId (parentId)}
						{@const person = peopleById.get(parentId)}
						<div class="relation-item">
							<span class="relation-name"
								>{person ? formatName(person) : "Unknown"}</span
							>
							<Tooltip text={mode === "view" ? "Click Edit to remove" : `Remove ${formatName(person || {})}`}>
								<Button
									type="button"
									variant="danger"
									fontSize="small"
									onclick={() =>
										handleRemoveRelation(
											"parentIds",
											parentId,
										)}
									ariaLabel="Remove {formatName(
										person || {},
									)}"
									disabled={mode === "view"}
								>
									<IconTrash size={20} /> Remove
								</Button>
							</Tooltip>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="divider"></div>

	<div class="relation-group">
		<div class="group-header">
			<IconUsers size={24} />
			<h2 class="group-title">Children</h2>
		</div>

		<div class="group-content">
			<Tooltip text={mode === "view" ? "Click Edit to add or remove children" : ""}>
				<RelationSelect
					placeholder="Add child"
					relationType="child"
					excludeIds={allAssignedIds}
					onSelect={(ids) => handleAddRelation("childrenIds", ids)}
					disabled={availablePeopleCount === 0 || mode === "view"}
				/>
			</Tooltip>

			{#if $personData.childrenIds.length === 0}
				<p class="empty-state">{getRelationLabel("Add child(ren)")}</p>
			{:else}
				<div class="relations-list">
					{#each $personData.childrenIds as childId (childId)}
						{@const person = peopleById.get(childId)}
						<div class="relation-item">
							<span class="relation-name"
								>{person ? formatName(person) : "Unknown"}</span
							>
							<Tooltip text={mode === "view" ? "Click Edit to remove" : `Remove ${formatName(person || {})}`}>
								<Button
									type="button"
									variant="danger"
									fontSize="small"
									onclick={() =>
										handleRemoveRelation(
											"childrenIds",
											childId,
										)}
									ariaLabel="Remove {formatName(
										person || {},
									)}"
									disabled={mode === "view"}
								>
									<IconTrash size={20} /> Remove
								</Button>
							</Tooltip>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="divider"></div>

	<div class="relation-group">
		<div class="group-header">
			<IconHeart size={24} />
			<h2 class="group-title">Partners</h2>
		</div>

		<div class="group-content">
			<Tooltip text={mode === "view" ? "Click Edit to add or remove partners" : ""}>
				<RelationSelect
					placeholder="Add partner"
					relationType="partner"
					excludeIds={allAssignedIds}
					onSelect={(ids) => handleAddRelation("partnerIds", ids)}
					disabled={availablePeopleCount === 0 || mode === "view"}
				/>
			</Tooltip>

			{#if $personData.partnerIds.length === 0}
				<p class="empty-state">{getRelationLabel("Add partner(s)")}</p>
			{:else}
				<div class="relations-list">
					{#each $personData.partnerIds as partnerId (partnerId)}
						{@const person = peopleById.get(partnerId)}
						<div class="relation-item">
							<span class="relation-name"
								>{person ? formatName(person) : "Unknown"}</span
							>
							<Tooltip text={mode === "view" ? "Click Edit to remove" : `Remove ${formatName(person || {})}`}>
								<Button
									type="button"
									variant="danger"
									fontSize="small"
									onclick={() =>
										handleRemoveRelation(
											"partnerIds",
											partnerId,
										)}
									ariaLabel="Remove {formatName(
										person || {},
									)}"
									disabled={mode === "view"}
								>
									<IconTrash size={20} /> Remove
								</Button>
							</Tooltip>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.no-people-banner {
		padding: 10px 14px;
		margin-bottom: 16px;
		background: color-mix(in srgb, var(--primary-colour) 8%, transparent);
		border: 1px solid
			color-mix(in srgb, var(--primary-colour) 20%, transparent);
		border-radius: 6px;
	}

	.no-people-banner p {
		margin: 0;
		font-size: var(--font-medium);
		color: var(--text-colour);
		opacity: 0.7;
	}

	.relationships-container {
		display: grid;
		grid-template-columns: 1fr 1px 1fr 1px 1fr;
		gap: 0;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.divider {
		width: 1px;
		background: color-mix(in srgb, var(--primary-colour) 20%, transparent);
		margin: 0;
	}

	.relation-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 0 20px;
		height: 100%;
		overflow: hidden;
		min-width: 0;
	}

	.relation-group:first-child {
		padding-left: 20px;
	}

	.relation-group:last-child {
		padding-right: 20px;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
		padding-top: 0;
	}

	.group-title {
		font-size: var(--font-large);
		font-weight: 600;
		color: var(--text-colour);
		margin: 0;
		padding: 0;
	}

	.group-header :global(svg) {
		color: var(--primary-colour);
		flex-shrink: 0;
	}

	.group-content {
		display: flex;
		flex-direction: column;
		gap: 12px;
		height: 100%;
		overflow: hidden;
	}

	.empty-state {
		font-size: var(--font-medium);
		color: var(--text-colour);
		opacity: 0.45;
		margin: 0;
		padding: 0;
	}

	.relations-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow-y: auto;
		padding-right: 4px;
		min-height: 0;
	}

	.relations-list::-webkit-scrollbar {
		width: 6px;
	}

	.relations-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.relations-list::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--primary-colour) 30%, transparent);
		border-radius: 3px;
	}

	.relations-list::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--primary-colour) 50%, transparent);
	}

	.relation-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: color-mix(in srgb, var(--primary-colour) 12%, transparent);
		border: 1px solid
			color-mix(in srgb, var(--primary-colour) 25%, transparent);
		border-radius: 4px;
		gap: 10px;
		flex-shrink: 0;
	}

	.relation-name {
		font-size: var(--font-medium);
		color: var(--text-colour);
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
