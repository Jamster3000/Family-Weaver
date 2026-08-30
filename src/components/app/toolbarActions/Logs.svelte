<script lang="ts">
	import { onMount, tick } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import Modal from "$components/ui/Modal.svelte";
	import Button from "$components/ui/Button.svelte";
	import Tooltip from "$components/ui/Tooltip.svelte";
	import { modals } from "$modalStore";
	import { createLogger } from "$lib/logger";
	import {
		IconChevronLeft,
		IconChevronRight,
		IconDownload,
	} from "@tabler/icons-svelte-runes";
	import { toasts } from "$toastStore";

	const logger = createLogger("Logs.svelte");

	interface LogEntry {
		timestamp: string;
		level: string;
		file: string;
		message: string;
		raw: string;
	}

	interface LogChunk {
		offset: number;
		items: LogEntry[];
	}

	const LOG_LEVELS = [
		"ALL",
		"INFO",
		"WARN",
		"ERROR",
		"DEBUG",
		"TRACE",
	] as const;

	let totalCount = $state<number>(0);
	let currentDate = $state<string>(new Date().toISOString().split("T")[0]);
	let selectedLogLevel = $state<string>("ALL");
	let loading = $state<boolean>(false);

	let logsContainer = $state<HTMLElement | null>(null);

	//Use of a atomic chunk state to prevent IPC race conditions
	let activeChunk = $state<LogChunk>({ offset: 0, items: [] });

	const ITEM_HEIGHT = 64;
	const BUFFER_SIZE = 40;

	let paddingTop = $derived(activeChunk.offset * ITEM_HEIGHT);
	let paddingBottom = $derived(
		Math.max(
			0,
			(totalCount - (activeChunk.offset + activeChunk.items.length)) *
				ITEM_HEIGHT,
		),
	);

	let isFetching = false;
	let pendingOffset: number | null = null;

	onMount(() => {
		loadLogs();
	});

	async function loadLogs() {
		loading = true;
		activeChunk = { offset: 0, items: [] };
		try {
			totalCount = await invoke<number>("load_log_file", {
				date: currentDate,
				logLevel: selectedLogLevel,
			});
			logger.info(
				`Loaded log metadata for ${currentDate} [Level: ${selectedLogLevel}]: ${totalCount} entries`,
			);

			if (totalCount > 0) {
				await fetchChunk(0);
				await tick();
				scrollToBottom();
			}
		} catch (error) {
			logger.error(`Failed to load log file metadata: ${error}`);
			totalCount = 0;
			activeChunk = { offset: 0, items: [] };
		} finally {
			loading = false;
		}
	}

	async function fetchChunk(offset: number) {
		if (isFetching) {
			pendingOffset = offset;
			return;
		}

		isFetching = true;
		const limit = BUFFER_SIZE * 2;

		try {
			const items = await invoke<LogEntry[]>("get_log_chunk", {
				offset,
				limit,
			});
			activeChunk = { offset, items };
		} catch (error) {
			logger.error(
				`Failed to fetch log chunk at offset ${offset}: ${error}`,
			);
		} finally {
			isFetching = false;
			if (
				pendingOffset !== null &&
				pendingOffset !== activeChunk.offset
			) {
				const next = pendingOffset;
				pendingOffset = null;
				fetchChunk(next);
			}
		}
	}

	function handleScroll(e: UIEvent) {
		const target = e.target as HTMLElement;
		const scrollTop = target.scrollTop;
		const containerHeight = target.clientHeight;

		const rawIndex = Math.floor(scrollTop / ITEM_HEIGHT);
		const targetOffset = Math.max(
			0,
			rawIndex - Math.floor(BUFFER_SIZE / 2),
		);

		const clampedOffset = Math.min(
			targetOffset,
			Math.max(0, totalCount - BUFFER_SIZE),
		);

		const currentEnd = activeChunk.offset + activeChunk.items.length;

		if (
			scrollTop < (activeChunk.offset + 5) * ITEM_HEIGHT ||
			scrollTop + containerHeight > (currentEnd - 5) * ITEM_HEIGHT
		) {
			fetchChunk(clampedOffset);
		}
	}

	function scrollToBottom() {
		if (!logsContainer) return;
		logsContainer.scrollTop = logsContainer.scrollHeight;
	}

	function handleLogLevelChange() {
		loadLogs();
	}

	function formatTimestamp(isoTime: string): string {
		if (!isoTime) return "--:--:--";
		const date = new Date(isoTime);
		if (isNaN(date.getTime())) return "--:--:--";
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	}

	function getLogLevelColor(level: string): string {
		switch (level.toUpperCase()) {
			case "ERROR":
				return "var(--red-error)";
			case "WARN":
				return "#FFA500";
			case "INFO":
				return "var(--primary-colour)";
			case "DEBUG":
				return "#888888";
			case "TRACE":
				return "#666666";
			default:
				return "var(--text-colour)";
		}
	}

	function getLogLevelBackground(level: string): string {
		switch (level.toUpperCase()) {
			case "ERROR":
				return "rgba(255, 0, 0, 0.1)";
			case "WARN":
				return "rgba(255, 165, 0, 0.1)";
			case "INFO":
				return "rgba(74, 124, 89, 0.05)";
			case "DEBUG":
				return "rgba(136, 136, 136, 0.05)";
			default:
				return "transparent";
		}
	}

	function changeDate(days: number) {
		const date = new Date(currentDate);
		date.setDate(date.getDate() + days);
		currentDate = date.toISOString().split("T")[0];
		loadLogs();
	}

	async function downloadLog() {
		try {
			await invoke("download_log_file", { date: currentDate });
			toasts.success(`Log '${currentDate}' copied to your 'download's' folder on your device`);
		} catch (error) {
			logger.error(`Failed to download log: ${error}`);
		}
	}

	function handleClose() {
		modals.close("logs");
	}
</script>

<Modal isOpen={$modals.logs} width="95%" padding="large" onClose={handleClose}>
	{#snippet header()}
		<div class="modal-header">
			<h1>Application Logs</h1>
			<h2>Viewing Log Date: {currentDate}</h2>
		</div>
	{/snippet}

	<div class="modal-content">
		<div class="controls-bar">
			<Tooltip text="Go backwards to a date before the viewed date.">
				<Button
					variant="secondary"
					onclick={() => changeDate(-1)}
					iconOnly
				>
					<IconChevronLeft size={40} />
				</Button>
			</Tooltip>

			<div class="filter-wrapper">
				<label for="log-level-select">Filter Log Level</label>
				<select
					id="log-level-select"
					bind:value={selectedLogLevel}
					onchange={handleLogLevelChange}
				>
					{#each LOG_LEVELS as level}
						<option value={level}>{level}</option>
					{/each}
				</select>
			</div>

			<Tooltip text="Go forwards to a date after the viewed date.">
				<Button
					variant="secondary"
					onclick={() => changeDate(1)}
					iconOnly
				>
					<IconChevronRight size={40} />
				</Button>
			</Tooltip>
		</div>

		<div
			bind:this={logsContainer}
			class="logs-container"
			onscroll={handleScroll}
		>
			{#if loading}
				<div class="loading">Loading logs...</div>
			{:else if totalCount === 0}
				<div class="empty">
					No logs found for {currentDate}
					{#if selectedLogLevel !== "ALL"}
						with level "{selectedLogLevel}"
					{/if}
				</div>
			{:else}
				<div
					class="virtual-scroll-wrapper"
					style="padding-top: {paddingTop}px; padding-bottom: {paddingBottom}px;"
				>
					<div class="logs-list">
						{#each activeChunk.items as entry, idx (activeChunk.offset + idx)}
							<div
								class="log-entry"
								style="background: {getLogLevelBackground(
									entry.level,
								)}; border-left: 4px solid {getLogLevelColor(
									entry.level,
								)};"
							>
								<div class="log-header">
									{#if entry.timestamp}
										<span class="time"
											>{formatTimestamp(
												entry.timestamp,
											)}</span
										>
									{/if}
									<span
										class="level"
										style="color: {getLogLevelColor(
											entry.level,
										)};"
									>
										{entry.level.toUpperCase()}
									</span>
									<span class="file">{entry.file}</span>
								</div>
								<div class="log-message">
									{entry.message}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="footer-controls">
			<Tooltip
				text="Downloads a copy of the active log file to your `downloads` folder on your device. Ideal for sending to the developer for them to fix bugs or problems you encounter with the app."
			>
				<Button onclick={downloadLog}>
					<IconDownload size={20} />
					Download Logs
				</Button>
			</Tooltip>
		</div>
	</div>
</Modal>

<style>
	.modal-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	h1 {
		margin: 0;
		font-size: var(--font-xlarge);
		font-weight: 700;
		color: var(--text-colour);
	}

	h2 {
		margin: 0;
		font-size: var(--font-large);
		font-weight: 500;
		color: var(--text-colour);
		opacity: 0.8;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 16px;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
	}

	.controls-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box;
		padding: 0;
	}

	.filter-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.filter-wrapper label {
		font-size: var(--font-medium);
		color: var(--text-colour);
		font-weight: 500;
	}

	.filter-wrapper select {
		padding: 6px 14px;
		border-radius: 6px;
		border: 1px solid var(--border-colour);
		background-color: var(--primary-background);
		color: var(--text-colour);
		font-size: var(--font-small);
		font-weight: 600;
		cursor: pointer;
		outline: none;
		transition: border-color var(--xshort-transition-duration) ease;
	}

	.filter-wrapper select:hover,
	.filter-wrapper select:focus {
		border-color: var(--primary-colour);
	}

	.logs-container {
		flex: 1;
		overflow-y: auto;
		border: 1px solid var(--border-colour);
		border-radius: 8px;
		padding: 16px;
		background: var(--primary-background);
		max-height: calc(100vh - 400px);
		width: 100%;
		box-sizing: border-box;
	}

	.virtual-scroll-wrapper {
		width: 100%;
		box-sizing: border-box;
	}

	.loading,
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-colour);
		opacity: 0.6;
		font-size: var(--font-medium);
	}

	.logs-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.log-entry {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 16px;
		border-radius: 6px;
		min-height: 64px;
		box-sizing: border-box;
	}

	.log-header {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: var(--font-small);
		width: 100%;
	}

	.time {
		font-family: monospace;
		color: var(--text-colour);
		opacity: 0.8;
		min-width: 75px;
		font-weight: 500;
	}

	.level {
		font-weight: 700;
		min-width: 65px;
		text-align: left;
	}

	.file {
		color: var(--text-colour);
		opacity: 0.65;
		font-size: 0.9em;
		font-family: monospace;
		margin-left: auto;
		text-align: right;
	}

	.log-message {
		color: var(--text-colour);
		font-size: var(--font-small);
		line-height: 1.6;
		max-width: 75ch;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: break-word;
		text-align: center;
		margin: 0 auto;
		opacity: 0.9;
	}

	.footer-controls {
		display: flex;
		justify-content: center;
		padding-top: 8px;
		width: 100%;
	}

	.footer-controls :global(.btn) {
		min-width: 200px;
	}
</style>
