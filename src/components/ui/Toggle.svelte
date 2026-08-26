<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let checked: boolean = false;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{ change: boolean }>();

	function handleToggle() {
		if (!disabled) {
			checked = !checked;
			dispatch('change', checked);
		}
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	{disabled}
	class="toggle-container"
	class:is-checked={checked}
	on:click={handleToggle}
>
	<span class="toggle-track">
		<span class="toggle-thumb"></span>
	</span>
	<span class="toggle-label" aria-hidden="true">
		{checked ? 'ON' : 'OFF'}
	</span>
</button>

<style>
	.toggle-container {
		all: unset;
		display: inline-flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		padding: 4px;
		border-radius: 8px;
		transition: background-color var(--xsmall-transition-duration) ease;
	}

	.toggle-container:focus-visible {
		outline: 2px solid var(--primary-colour);
		outline-offset: 4px;
	}

	.toggle-container:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.toggle-track {
		position: relative;
		width: 56px;
		height: 32px;
		background-color: var(--secondary-background);
		border: 2px solid var(--border-colour);
		border-radius: 999px;
		transition: all var(--short-transition-duration) ease;
	}

	.toggle-container.is-checked .toggle-track {
		background-color: var(--primary-colour);
		border-color: var(--primary-colour);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 24px;
		height: 24px;
		background-color: var(--text-colour);
		border-radius: 50%;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.toggle-container.is-checked .toggle-thumb {
		transform: translateX(24px);
		background-color: var(--primary-background);
	}

	.toggle-label {
		font-size: var(--font-medium);
		font-family: var(--font-primary);
		font-weight: 600;
		color: var(--text-colour);
		min-width: 40px;
		text-align: left;
		user-select: none;
	}
</style>