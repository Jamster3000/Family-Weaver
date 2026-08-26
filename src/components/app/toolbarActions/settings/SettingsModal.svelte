<script lang="ts">
	import Modal from "$components/ui/Modal.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { IconInfoCircle } from "@tabler/icons-svelte-runes";
	import { modals, settingsModal } from "$modalStore";
	import { settingsData } from "$settingsStore";
	import { fade } from "svelte/transition";
	import SettingsBool from "./SettingsBool.svelte";
	import SettingsEnum from "./SettingsEnum.svelte";
	import SettingsInt from "./SettingsInt.svelte";
	import SettingsFloat from "./SettingsFloat.svelte";
	import SettingsAction from "./SettingsAction.svelte";

	let selectedCategory: string | null = null;

	function handleClose() {
		modals.close("settings");
	}

	$: categories = Array.from(
		new Set($settingsData.map((s) => s.category)),
	).sort();

	$: categorySettings = selectedCategory
		? $settingsData.filter((s) => s.category === selectedCategory)
		: [];

	$: if ($settingsModal && !selectedCategory && categories.length > 0) {
		selectedCategory = categories[0];
	}

	function getCategoryDisplayName(category: string): string {
		const names: Record<string, string> = {
			Appearance: "Appearance",
			Accessibility: "Accessibility",
			Updates: "Updates",
			Notifications: "Notifications",
			General: "General",
			DataManagement: "Data Management",
		};
		return names[category] || category;
	}

	function getSettingComponent(valueType: any) {
		if (valueType === "Bool") return SettingsBool;
		if (valueType === "Int") return SettingsInt;
		if (valueType === "Float") return SettingsFloat;
		if (valueType && typeof valueType === "object" && "Enum" in valueType)
			return SettingsEnum;
		if (valueType === "Action") return SettingsAction;
		return null;
	}
</script>

<Modal
	isOpen={$settingsModal}
	width="80%"
	padding="none"
	onClose={handleClose}
	showClose={true}
>
	<div class="settings-container">
		<aside class="settings-sidebar">
			<div class="sidebar-header">
				<h3>Categories</h3>
			</div>

			<nav class="categories-list">
				{#each categories as category (category)}
					<button
						class="category-button"
						class:active={selectedCategory === category}
						on:click={() => (selectedCategory = category)}
						type="button"
					>
						<span class="category-name">
							{getCategoryDisplayName(category)}
						</span>
					</button>
				{/each}
			</nav>
		</aside>

		<main class="settings-main">
			<div class="settings-header">
				<h2>
					{selectedCategory ? getCategoryDisplayName(selectedCategory) : "Settings"}
				</h2>
			</div>

			<div class="settings-content">
				{#if categorySettings.length > 0}
					<div class="settings-list" in:fade={{ duration: 150 }}>
						{#each categorySettings as setting (setting.key)}
							<div class="setting-item">
								<div class="setting-info">
									<div class="setting-title-row">
										<p class="setting-name">
											{setting.name}
										</p>
										{#if setting.long_description}
											<Tooltip text={setting.long_description} position="top">
												<button type="button" class="info-icon-btn" aria-label="More information about {setting.name}">
													<IconInfoCircle size={22} stroke={1.5} />
												</button>
											</Tooltip>
										{/if}
									</div>
									<p class="setting-description">
										{setting.short_description}
									</p>
								</div>

								<div class="setting-control">
									{#key setting.key}
										{@const Component = getSettingComponent(
											setting.value_type,
										)}
										{#if Component}
											<svelte:component
												this={Component}
												{setting}
											/>
										{/if}
									{/key}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<p>No settings found in this category.</p>
					</div>
				{/if}
			</div>
		</main>
	</div>
</Modal>

<style>
	.settings-container {
		display: grid;
		grid-template-columns: 240px 1fr;
		width: 100%;
		height: 70vh;
		min-height: 500px;
		max-height: 800px;
		border-radius: 12px;
		overflow: hidden;
		background: var(--primary-background);
	}

	.settings-sidebar {
		background: color-mix(
			in srgb,
			var(--secondary-background) 60%,
			transparent
		);
		border-right: 1px solid var(--border-colour);
		display: flex;
		flex-direction: column;
	}

	.sidebar-header {
		padding: 24px 20px 12px 20px;
	}

	.sidebar-header h3 {
		margin: 0;
		font-size: var(--font-small);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 700;
		color: var(--text-colour);
		opacity: 0.5;
	}

	.categories-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px 12px;
		overflow-y: auto;
		flex: 1;
	}

	.category-button {
		all: unset;
		display: block;
		padding: 10px 14px;
		border-radius: 6px;
		color: var(--text-colour);
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		font-weight: 500;
		cursor: pointer;
		text-align: left;
		transition: all 0.15s ease;
		opacity: 0.7;
	}

	.category-button:hover {
		opacity: 1;
		background: color-mix(in srgb, var(--text-colour) 5%, transparent);
	}

	.category-button.active {
		opacity: 1;
		background: color-mix(in srgb, var(--primary-colour) 15%, transparent);
		font-weight: 600;
		color: var(--primary-colour);
	}

	.settings-main {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background: var(--primary-background);
	}

	.settings-header {
		padding: 24px 48px 24px 32px;
		border-bottom: 1px solid var(--border-colour);
	}

	.settings-header h2 {
		margin: 0;
		font-size: var(--font-xlarge);
		font-weight: 700;
		color: var(--text-colour);
	}

	.settings-content {
		flex: 1;
		overflow-y: auto;
		padding: 24px 32px;
	}

	.settings-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: auto;
	}

	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 16px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--border-colour) 40%, transparent);
		padding: 0;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.setting-info {
		flex: 1;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.setting-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.setting-name {
		font-size: var(--font-medium);
		font-weight: 500;
		color: var(--text-colour);
		margin: 0;
	}

	.info-icon-btn {
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--text-colour);
		opacity: 0.4;
		cursor: help;
		border-radius: 50%;
		padding: 8px;
		margin: -8px;
		transition: all 0.2s ease;
	}

	.info-icon-btn:hover, .info-icon-btn:focus-visible {
		opacity: 1;
		color: var(--primary-colour);
		background: color-mix(in srgb, var(--text-colour) 8%, transparent);
	}

	.setting-description {
		font-size: var(--font-small);
		color: var(--text-colour);
		opacity: 0.6;
		margin: 0;
		line-height: 1.5;
	}

	.setting-control {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
		min-width: 180px;
		justify-content: flex-end;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-colour);
		opacity: 0.5;
	}
</style>