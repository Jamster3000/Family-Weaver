<script lang="ts">
  import { IconX } from '@tabler/icons-svelte-runes';
  import Tooltip from '$components/ui/Tooltip.svelte';

  export let onClick: (() => void) | undefined = undefined;
  export let tooltipText = 'Close';
  export let size = 20;
</script>

<div class="close-button-wrapper">
  <Tooltip text={tooltipText} position="top">
    <button
      class="close-button"
      on:click={onClick}
      aria-label={tooltipText}
      type="button"
    >
      <IconX {size} />
    </button>
  </Tooltip>
</div>

<style>
  .close-button-wrapper {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
  }

  .close-button {
    background: transparent;
    border: 1px solid var(--border-colour, #3f4252);
    color: var(--text-colour, #fff);
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: background 0.15s, border-color 0.15s;
  }

  .close-button:hover {
    background: color-mix(in srgb, var(--primary-colour, #4a7c59) 40%, transparent);
    border-color: var(--primary-colour, #4a7c59);
  }

  .close-button:active {
    background: color-mix(in srgb, var(--primary-colour, #4a7c59) 20%, transparent);
  }
</style>