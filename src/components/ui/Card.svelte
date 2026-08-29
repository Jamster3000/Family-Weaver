<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		padding = "medium",
		width = "100%",
		height = "auto",
		center = true,
		variant = "default",
		children,
	}: {
		padding?: "none" | "small" | "medium" | "large" | "xlarge";
		width?: string;
		height?: string;
		center?: boolean;
		variant?: "default";
		children?: Snippet;
	} = $props();
</script>

<div
	class="card {padding} {variant}"
	class:center
	style="--card-width: {width}; --card-height: {height};"
>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	:root {
		--card-width: 100%;
		--card-height: auto;
	}

	.card {
		position: relative;
		width: var(--card-width);
		height: var(--card-height);
		border-radius: 12px;
		border: 1px solid var(--border-colour);
		color: var(--text-colour);
		box-sizing: border-box;
	}

	.card.center {
		margin-left: auto;
		margin-right: auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.default {
		background: var(--secondary-background);
	}

	.none {
		padding: 0;
	}

	.small {
		padding: 1.5rem;
	}

	.medium {
		padding: 2rem;
	}

	.large {
		padding: 2.5rem;
	}

	.xlarge {
		padding: 4rem;
	}
</style>
