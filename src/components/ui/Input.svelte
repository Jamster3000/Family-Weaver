<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import flatpickr from "flatpickr";
	import "flatpickr/dist/flatpickr.min.css";
	import { IconCalendarWeek } from "@tabler/icons-svelte-runes";
	import { settingsData } from "$lib/stores/settingsStore";
	import { getFlatpickrFormat, attachCustomYearSelect } from "$lib/flatpickrUtils";

	import darkTheme from "flatpickr/dist/themes/dark.css?inline";
	import lightTheme from "flatpickr/dist/themes/light.css?inline";

	let {
		label = "",
		type = "text",
		placeholder = "",
		value = $bindable(""),
		error = "",
		helper = "",
		disabled = false,
		readonly = false,
		required = false,
		counter = false,
		maxLength = undefined,
		multiline = false,
		id = crypto.randomUUID(),
		centerPlaceholder = true,
		oninput,
		onblur,
		onfocus,
	}: {
		label?: string;
		type?: "text" | "email" | "hidden" | "number" | "search" | "tel" | "url" | "date" | "datetime-local" | "month" | "time" | "week" | "color";
		placeholder?: string;
		value?: string;
		error?: string;
		helper?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		counter?: boolean;
		maxLength?: number;
		multiline?: boolean;
		id?: string;
		centerPlaceholder?: boolean;
		oninput?: (e: Event) => void;
		onblur?: (e: FocusEvent) => void;
		onfocus?: (e: FocusEvent) => void;
	} = $props();

	//valid types the input is allowed to be.
	const validTypes = [
		"text", "email", "hidden", "number", "search",
		"tel", "url", "date", "datetime-local", "month",
		"time", "week", "color",
	];

	// Ensure the type is valid, defaulting to "text" if not
	let safeType = $derived(
		type === "date" ? "text" : validTypes.includes(type) ? type : "text"
	);

	// Calculate width based on placeholder length
	const charWidth = 8.5;
	const bufferPixels = 56;
	let calculatedWidth = $derived(
		placeholder ? `${placeholder.length * charWidth + bufferPixels}px` : "auto"
	);

	// Get the theme based on the appearance mode setting
	// This is specifically for light and dark css themes available for flatpickr.
	let appearanceMode = $derived($settingsData.find((s) => s.key === "appearance_mode"));
	let systemPrefersDark = $state(false);

	let isDark = $derived.by(() => {
		if (!appearanceMode?.value) return systemPrefersDark;
		const val = appearanceMode.value as Record<string, any>;
		const modeVal = ((val.Enum || val.Text || "") as string).toLowerCase();

		if (modeVal === "dark") return true;
		if (modeVal === "light") return false;

		return systemPrefersDark;
	});

	let currentTheme = $derived(isDark ? darkTheme : lightTheme);

	//The user's prefered date format, changing in settings.
	let dateSetting = $derived($settingsData.find((s) => s.key === "date_format"));
	let rawFormatString = $derived(
		dateSetting?.value && "Text" in dateSetting.value ? dateSetting.value.Text : ""
	);
	let activeDateFormat = $derived(getFlatpickrFormat(rawFormatString));

	// Flatpickr refs
	let inputNode: HTMLInputElement | undefined = $state();
	let fpNode: HTMLInputElement | undefined = $state();
	let fp: flatpickr.Instance | undefined = $state();

	onMount(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		systemPrefersDark = mediaQuery.matches;

		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			systemPrefersDark = e.matches;
		};
		mediaQuery.addEventListener("change", handleSystemThemeChange);

		if (type === "date" && fpNode) {
			fp = flatpickr(fpNode, {
				dateFormat: activeDateFormat,
				clickOpens: false,
				onReady: (_, __, instance) => attachCustomYearSelect(instance),
				onChange: (_, dateStr) => {
					value = dateStr;
					if (inputNode) {
						inputNode.value = dateStr;
						inputNode.dispatchEvent(new Event("input", { bubbles: true }));
					}
				},
			});
		}

		return () => {
			mediaQuery.removeEventListener("change", handleSystemThemeChange);
		};
	});

	onDestroy(() => {
		if (fp) fp.destroy();
	});

	$effect(() => {
		if (fp && activeDateFormat) {
			fp.set("dateFormat", activeDateFormat);
			if (value) {
				const parsedDate = fp.parseDate(value, activeDateFormat);
				if (parsedDate) fp.setDate(parsedDate, false, activeDateFormat);
			}
		}
	});

	$effect(() => {
		if (fp && typeof value === "string") {
			fp.setDate(value || "", false);
		}
	});

	function openCalendar(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (fp && !disabled) {
			fp.open();
		}
	}
</script>

<svelte:head>
	{@html `<style id="flatpickr-theme">${currentTheme}</style>`}
</svelte:head>

<div class="field">
	{#if label}
		<label for={id}>
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<div
		class="input-wrap"
		class:error={!!error}
		class:disabled
		class:multiline
		class:readonly
		class:centerPlaceholder
		style="width: {calculatedWidth}"
	>
		{#if multiline}
			<textarea
				{id}
				{placeholder}
				{disabled}
				{readonly}
				{required}
				maxlength={maxLength}
				data-testid="textarea-field"
				bind:value
				{oninput}
				{onblur}
				{onfocus}
			></textarea>
		{:else}
			<input
				bind:this={inputNode}
				{id}
				type={safeType}
				{placeholder}
				{disabled}
				{readonly}
				{required}
				maxlength={maxLength}
				data-testid="input-field"
				bind:value
				{oninput}
				{onblur}
				{onfocus}
			/>
			{#if type === "date"}
				<input
					bind:this={fpNode}
					tabindex="-1"
					style="position: absolute; bottom: 0; left: 0; width: 100%; height: 0; opacity: 0; pointer-events: none; border: none; padding: 0; margin: 0;"
				/>
				<button
					type="button"
					class="calendar-btn"
					onclick={openCalendar}
					{disabled}
					title="Open Calendar"
				>
					<IconCalendarWeek size={22} />
				</button>
			{/if}
		{/if}
	</div>

	<div class="counter">
		{#if counter}
			<span class="counter">
				{value.length}{maxLength !== undefined ? ` / ${maxLength}` : ""}
			</span>
		{/if}
	</div>

	{#if error}
		<span class="helper error-text">{error}</span>
	{:else if helper}
		<span class="helper">{helper}</span>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		text-align: left;
		width: 100%;
	}

	label {
		font-size: var(--font-medium);
		font-weight: 400;
		color: var(--text-colour);
	}

	.field:focus-within label {
		color: var(--secondary-colour);
		font-weight: 600;
	}

	.required {
		color: var(--red-error);
		margin-left: 2px;
	}

	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		background: color-mix(in srgb, var(--secondary-background) 75%, black);
		border: 2px solid
			color-mix(in srgb, var(--primary-colour) 50%, transparent);
		border-radius: 8px;
		transition:
			border-color var(--short-transition-duration),
			box-shadow var(--short-transition-duration),
			background var(--short-transition-duration);
		padding-right: 6px;
	}

	.input-wrap:focus-within {
		border: 2px solid var(--primary-colour);
		box-shadow: 0 0 0 4px
			color-mix(in srgb, var(--primary-colour) 40%, transparent);
		background: color-mix(
			in srgb,
			var(--secondary-background) 80%,
			white 10%
		);
	}

	.input-wrap.multiline {
		align-items: flex-start;
		padding: 0;
	}

	.input-wrap.error {
		border-color: var(--red-error);
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--red-error) 15%, transparent);
	}

	.input-wrap.disabled {
		background: color-mix(in srgb, var(--secondary-background) 70%, black);
		opacity: 0.6;
		cursor: not-allowed;
	}

	input,
	textarea {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		padding: 10px 14px;
		font-size: var(--font-small);
		font-family: var(--font-primary);
		color: var(--text-colour);
		width: 100%;
		caret-color: var(--primary-colour);
	}

	textarea {
		resize: vertical;
		min-height: 160px;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--text-colour);
		opacity: 0.6;
	}

	.input-wrap.centerPlaceholder input::placeholder,
	.input-wrap.centerPlaceholder textarea::placeholder {
		text-align: center;
	}

	.input-wrap.centerPlaceholder input,
	.input-wrap.centerPlaceholder textarea {
		text-align: center;
	}

	input:read-only,
	textarea:read-only {
		cursor: not-allowed;
	}

	input:disabled,
	textarea:disabled {
		cursor: not-allowed;
	}

	.calendar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(
			in srgb,
			var(--secondary-background) 90%,
			white 5%
		);
		border: 1px solid
			color-mix(in srgb, var(--border-colour) 70%, transparent);
		border-radius: 6px;
		padding: 4px 6px;
		color: var(--text-colour);
		opacity: 0.8;
		cursor: pointer;
		transition: all var(--xshort-transition-duration) ease;
	}

	.calendar-btn:hover:not(:disabled) {
		opacity: 1;
		color: var(--primary-colour);
		border-color: var(--primary-colour);
		background: color-mix(in srgb, var(--primary-colour) 10%, transparent);
	}

	.calendar-btn:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.helper {
		font-size: var(--font-small);
		font-weight: 400;
		color: var(--text-colour);
	}

	.error-text {
		color: var(--red-error);
	}

	.counter {
		color: var(--text-colour);
		font-size: var(--font-small);
		opacity: 0.8;
	}
</style>