<script lang="ts">
	import { personTreeStore, type Person } from "$personTreeStore";
	import { personData } from "$personStore";
	import {
		IconChevronDown,
		IconSearch,
		IconCheck,
	} from "@tabler/icons-svelte-runes";
	import {
		getSuggestedPeople,
		type RelationType,
	} from "$lib/relationSuggestions";

	let {
		placeholder = "Add relations",
		relationType,
		excludeIds = [],
		onSelect,
		disabled = false,
	}: {
		placeholder?: string;
		relationType?: RelationType;
		excludeIds?: string[];
		onSelect: (selectedIds: string[]) => void;
		disabled?: boolean;
	} = $props();

	let isOpen = $state(false);
	let searchQuery = $state("");
	let selectedIds = $state<string[]>([]);
	let triggerEl = $state<HTMLButtonElement | null>(null);
	let dropdownPanelEl = $state<HTMLDivElement | null>(null);
	let coords = $state({ top: 0, left: 0, width: 0 });

	function formatName(person: Person): string {
		const name = [person.firstName, person.lastName]
			.filter(Boolean)
			.join(" ");
		return name || "Unnamed Person";
	}

	// Everyone section: completely unfiltered by genealogical tree rules
	let availablePeople = $derived(
		$personTreeStore.filter((p) => !excludeIds.includes(p.id)),
	);

	let searchResults = $derived(
		searchQuery.trim()
			? availablePeople.filter((p) => {
					const fullName =
						`${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase();
					return fullName.includes(searchQuery.trim().toLowerCase());
				})
			: [],
	);

	// Suggested section: applies logical tree rules and DOB checks
	let suggestedPeople = $derived(
		getSuggestedPeople(
			relationType,
			$personData,
			$personTreeStore,
			excludeIds,
		),
	);

	function updatePosition() {
		if (triggerEl) {
			const rect = triggerEl.getBoundingClientRect();
			coords = {
				top: rect.bottom + 4,
				left: rect.left,
				width: rect.width,
			};
		}
	}

	function toggleOpen() {
		if (!isOpen) {
			updatePosition();
			isOpen = true;
		} else {
			closeDropdown();
		}
	}

	function closeDropdown() {
		isOpen = false;
		searchQuery = "";
		selectedIds = [];
	}

	function togglePerson(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((selectedId) => selectedId !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleConfirm() {
		if (selectedIds.length > 0) {
			onSelect(selectedIds);
		}
		closeDropdown();
	}

	function focusOnMount(node: HTMLInputElement) {
		node.focus();
	}

	function handleWindowClick(e: MouseEvent) {
		if (!isOpen) return;
		const target = e.target as Node;

		const isOutside =
			triggerEl &&
			!triggerEl.contains(target) &&
			dropdownPanelEl &&
			!dropdownPanelEl.contains(target);

		if (isOutside) {
			if (selectedIds.length > 0) {
				onSelect(selectedIds);
			}
			closeDropdown();
		}
	}

	function handleWindowScrollOrResize() {
		if (isOpen) {
			updatePosition();
		}
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onscroll={handleWindowScrollOrResize}
	onresize={handleWindowScrollOrResize}
/>

<div class="custom-select-wrapper">
	<button
		bind:this={triggerEl}
		type="button"
		class="select-trigger"
		onclick={toggleOpen}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		{disabled}
	>
		<span>
			{selectedIds.length > 0
				? `${selectedIds.length} selected`
				: placeholder}
		</span>
		<IconChevronDown size={18} class="chevron {isOpen ? 'rotated' : ''}" />
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownPanelEl}
			class="dropdown-panel"
			style="top: {coords.top}px; left: {coords.left}px; width: {coords.width}px;"
		>
			<div class="search-header">
				<IconSearch size={18} class="search-icon" />
				<input
					type="text"
					class="search-input"
					placeholder="Search name..."
					bind:value={searchQuery}
					use:focusOnMount
				/>
			</div>

			<div class="options-container">
				{#if searchQuery.trim()}
					<div class="section-group">
						<div class="section-header search-results-header">
							<span class="section-title">Search Results</span>
							<span class="section-count"
								>({searchResults.length})</span
							>
						</div>
						{#if searchResults.length > 0}
							{#each searchResults as person (`search-${person.id}`)}
								<label class="option-item">
									<input
										type="checkbox"
										class="checkbox-input"
										checked={selectedIds.includes(
											person.id,
										)}
										onchange={() => togglePerson(person.id)}
									/>
									<span
										class="checkbox-custom"
										aria-hidden="true"
									>
										{#if selectedIds.includes(person.id)}
											<IconCheck size={18} stroke={3} />
										{/if}
									</span>
									<span class="person-name"
										>{formatName(person)}</span
									>
								</label>
							{/each}
						{:else}
							<div class="no-results">
								No matching names found
							</div>
						{/if}
					</div>
				{/if}

				{#if suggestedPeople.length > 0}
					<div class="section-group">
						<div class="section-header suggested-header">
							<span class="section-title">Suggested</span>
							<span class="section-count"
								>({suggestedPeople.length})</span
							>
						</div>
						{#each suggestedPeople as person (`suggested-${person.id}`)}
							<label class="option-item">
								<input
									type="checkbox"
									class="checkbox-input"
									checked={selectedIds.includes(person.id)}
									onchange={() => togglePerson(person.id)}
								/>
								<span
									class="checkbox-custom"
									aria-hidden="true"
								>
									{#if selectedIds.includes(person.id)}
										<IconCheck size={18} stroke={3} />
									{/if}
								</span>
								<span class="person-name"
									>{formatName(person)}</span
								>
							</label>
						{/each}
					</div>
				{/if}

				<div class="section-group">
					<div class="section-header">
						<span class="section-title">Everyone</span>
						<span class="section-count"
							>({availablePeople.length})</span
						>
					</div>
					{#if availablePeople.length > 0}
						{#each availablePeople as person (`everyone-${person.id}`)}
							<label class="option-item">
								<input
									type="checkbox"
									class="checkbox-input"
									checked={selectedIds.includes(person.id)}
									onchange={() => togglePerson(person.id)}
								/>
								<span
									class="checkbox-custom"
									aria-hidden="true"
								>
									{#if selectedIds.includes(person.id)}
										<IconCheck size={18} stroke={3} />
									{/if}
								</span>
								<span class="person-name"
									>{formatName(person)}</span
								>
							</label>
						{/each}
					{:else}
						<div class="no-results">No candidates available</div>
					{/if}
				</div>
			</div>

			<div class="dropdown-footer">
				<button
					type="button"
					class="confirm-btn"
					disabled={selectedIds.length === 0}
					onclick={handleConfirm}
				>
					Add {selectedIds.length > 0
						? `(${selectedIds.length})`
						: ""}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-select-wrapper {
		position: relative;
		width: 100%;
		flex-shrink: 0;
		font-family: var(--font-primary);
	}

	.select-trigger {
		width: 100%;
		padding: 8px 12px;
		background: var(--secondary-background);
		border: 1px solid var(--border-colour);
		border-radius: 4px;
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		line-height: var(--base-line-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		min-height: 40px;
		box-sizing: border-box;
		transition: border-color var(--xshort-transition-duration) ease;
	}

	.select-trigger:focus-visible {
		outline: 2px solid var(--primary-colour);
		border-color: var(--primary-colour);
	}

	.select-trigger span {
		color: var(--text-colour);
	}

	:global(.chevron) {
		transition: transform var(--xshort-transition-duration) ease;
		color: var(--secondary-colour);
	}

	:global(.chevron.rotated) {
		transform: rotate(180deg);
	}

	.dropdown-panel {
		position: fixed;
		background: var(--secondary-background);
		border: 1px solid var(--border-colour);
		border-radius: 4px;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		box-sizing: border-box;
		font-family: var(--font-primary);
	}

	.search-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-bottom: 1px solid var(--border-colour);
		background: var(--primary-background);
		flex-shrink: 0;
	}

	:global(.search-icon) {
		color: var(--secondary-colour);
		flex-shrink: 0;
	}

	.search-input {
		width: 100%;
		background: transparent;
		border: none;
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		line-height: var(--base-line-height);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--text-colour);
		opacity: 0.6;
	}

	.options-container {
		display: flex;
		flex-direction: column;
		max-height: 280px;
		overflow-y: auto;
		background: var(--secondary-background);
	}

	.options-container::-webkit-scrollbar {
		width: 6px;
	}

	.options-container::-webkit-scrollbar-track {
		background: var(--primary-background);
	}

	.options-container::-webkit-scrollbar-thumb {
		background: var(--border-colour);
		border-radius: 3px;
	}

	.section-group {
		display: flex;
		flex-direction: column;
	}

	.section-header {
		padding: 4px 10px;
		background: var(--primary-background);
		border-top: 1px solid var(--border-colour);
		border-bottom: 1px solid var(--border-colour);
		display: flex;
		align-items: baseline;
		gap: 6px;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.section-title {
		font-size: var(--font-medium);
		font-weight: 700;
		color: var(--text-colour);
	}

	.section-count {
		font-size: var(--font-small);
		font-weight: 400;
		color: var(--secondary-colour);
	}

	.search-results-header .section-title,
	.suggested-header .section-title {
		color: var(--primary-colour);
	}

	.option-item {
		width: 100%;
		padding: 4px 10px;
		min-height: 34px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 10px;
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		text-align: left;
		cursor: pointer;
		user-select: none;
		box-sizing: border-box;
		transition: background var(--xshort-transition-duration) ease;
		border-bottom: 1px solid
			color-mix(in srgb, var(--border-colour) 15%, transparent);
	}

	.option-item:hover {
		background: color-mix(
			in srgb,
			var(--primary-colour) 18%,
			var(--secondary-background)
		);
	}

	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.checkbox-custom {
		width: 25px;
		height: 25px;
		min-width: 25px;
		min-height: 25px;
		border-radius: 4px;
		border: 2px solid var(--border-colour);
		background: var(--primary-background);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--white);
		transition:
			border-color var(--xshort-transition-duration) ease,
			background-color var(--xshort-transition-duration) ease;
	}

	.option-item:hover .checkbox-custom {
		border-color: var(--primary-colour);
	}

	.checkbox-input:focus-visible + .checkbox-custom {
		outline: 2px solid var(--primary-colour);
	}

	.checkbox-input:checked + .checkbox-custom {
		border-color: var(--primary-colour);
		background: var(--primary-colour);
	}

	.person-name {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: var(--base-line-height);
	}

	.dropdown-footer {
		padding: 6px 10px;
		border-top: 1px solid var(--border-colour);
		background: var(--primary-background);
		display: flex;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	.confirm-btn {
		width: 100%;
		padding: 6px 12px;
		min-height: 34px;
		background: var(--primary-colour);
		color: var(--white);
		border: none;
		border-radius: 4px;
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		font-weight: 600;
		cursor: pointer;
		transition:
			opacity var(--xshort-transition-duration) ease,
			background-color var(--xshort-transition-duration) ease;
	}

	.confirm-btn:disabled {
		background: var(--secondary-background);
		color: var(--text-colour);
		opacity: 0.4;
		cursor: not-allowed;
		border: 1px solid var(--border-colour);
	}

	.confirm-btn:not(:disabled):hover {
		opacity: 0.9;
	}

	.no-results {
		padding: 8px 10px;
		font-size: var(--font-medium);
		color: var(--text-colour);
		opacity: 0.7;
		text-align: left;
	}

	.select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--primary-background);
		border-color: var(--border-colour);
	}

	.select-trigger:disabled:hover {
		border-color: var(--border-colour);
	}

	.select-trigger:disabled span {
		color: var(--secondary-colour);
	}

	.select-trigger:disabled :global(.chevron) {
		opacity: 0.5;
	}
</style>
