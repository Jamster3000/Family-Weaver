<script lang="ts">
	import Button from "$components/ui/Button.svelte";
	import Input from "$components/ui/Input.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { personData, updatePersonData, type TimelineEntry } from "$stores";
	import { IconArrowLeft, IconPlus } from "@tabler/icons-svelte-runes";

	type CategoryKey = "lifeEvents" | "workEducation" | "placesLived";

	export let categoryKey: CategoryKey;
	export let categoryTitle: string = "";
	export let onCancel: () => void;
	export let onSave: () => void;

	let title = "";
	let startDate = "";
	let endDate = "";
	let description = "";

	$: isValid = title.trim().length > 0;

	function handleSubmit() {
		if (!isValid) return;

		const newEntry: TimelineEntry = {
			id: crypto.randomUUID(),
			title: title.trim(),
			description: description.trim() || "",
			startDate: startDate.trim() || null,
			endDate: endDate.trim() || null,
			location: null,
		};

		const currentEntries = $personData?.[categoryKey] ?? [];
		updatePersonData({
			[categoryKey]: [...currentEntries, newEntry],
		});

		onSave();
	}
</script>

<div class="form-container">
	<div class="form-header">
		<Tooltip text="Cancel and return to '{categoryTitle}' timeline.">
			<button
				class="back-btn"
				on:click={onCancel}
				type="button"
				aria-label="Cancel and return to list"
			>
				<IconArrowLeft size={18} stroke={1.5} />
				<span>Back to Entries</span>
			</button>
		</Tooltip>

		<h2>Add {categoryTitle} Entry</h2>

		{#if !isValid}
			<Tooltip text="Enter information first before adding.">
				<Button type="button" disabled={!isValid}>
					<IconPlus size={18} stroke={2} />
					<span>Add Entry</span>
				</Button>
			</Tooltip>
		{:else}
			<Tooltip text="Add this entry to the {categoryTitle} timeline.">
				<Button
					type="button"
					disabled={!isValid}
					on:click={handleSubmit}
				>
					<IconPlus size={18} stroke={2} />
					<span>Add Entry</span>
				</Button>
			</Tooltip>
		{/if}
	</div>

	<div class="row-single">
		<Input
			label="Event Title"
			placeholder="e.g. Graduated University, Married, Moved to Chicago"
			bind:value={title}
			centerPlaceholder={false}
		/>
	</div>

	<div class="row-two-col">
		<Input
			label="Start Date"
			placeholder="e.g. 1915 or 14 May 1915"
			bind:value={startDate}
			centerPlaceholder={false}
		/>
		<Input
			label="End Date"
			placeholder="e.g. 1919"
			bind:value={endDate}
			centerPlaceholder={false}
		/>
	</div>

	<div class="field-description">
		<Input
			label="Description"
			placeholder="Add context, details, or notes..."
			bind:value={description}
			multiline={true}
			centerPlaceholder={false}
		/>
	</div>
</div>

<style>
	.form-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 8px;
		border-bottom: 1px solid
			color-mix(in srgb, var(--border-colour) 30%, transparent);
	}

	.form-header h2 {
		font-size: var(--font-large);
		font-weight: 600;
		color: var(--text-colour);
		margin: 0;
	}

	.back-btn {
		all: unset;
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--primary-colour);
		font-size: var(--font-small);
		font-weight: 600;
		cursor: pointer;
	}

	.back-btn:hover {
		text-decoration: underline;
	}

	.row-single {
		width: 100%;
	}

	.row-two-col {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		width: 100%;
	}

	.field-description {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	:global(.form-container .field) {
		width: 100% !important;
	}

	:global(.form-container .input-wrap) {
		width: 100% !important;
	}

	:global(.field-description .field) {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	:global(.field-description .input-wrap.multiline) {
		flex: 1;
		display: flex;
	}

	:global(.field-description textarea) {
		height: 100% !important;
		min-height: 80px;
		resize: none;
	}
</style>
