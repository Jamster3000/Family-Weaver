<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { IconX } from '@tabler/icons-svelte-runes';
  import Tooltip from '$components/ui/Tooltip.svelte';

  export let isOpen = false;
  export let onClose: (() => void) | undefined = undefined;
  export let closeOnBackdrop = false;
  export let showCloseButton = false;

  function handleBackdropClick(e: MouseEvent) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      isOpen = false;
      onClose?.();
    }
  }

  function handleCloseClick() {
    isOpen = false;
    onClose?.();
  }
</script>

{#if isOpen}
  <div
      class="dialog-backdrop"
      on:click={handleBackdropClick}
      data-testid="popup-backdrop"
      role="presentation"
      tabindex="-1"
      transition:fade={{ duration: 500 }}
    >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="dialog-container"
      on:click={handleBackdropClick}
      transition:fly={{ y: 20, duration: 300, easing: quintOut }}
    >
      <div class="content-wrapper">
        {#if showCloseButton}
          <Tooltip text="Close popup" position="top">
            <button
              class="close-button"
              on:click={handleCloseClick}
              aria-label="Close popup"
              type="button"
            >
              <IconX size={24} />
            </button>
          </Tooltip>
        {/if}
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .content-wrapper {
    position: relative;
  }

  .dialog-backdrop {
    position: fixed;
    left: 0;
    right: 0;
    top: calc(var(--titlebar-height, 0px) + var(--header-height, 0px));
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
  }

  .dialog-container {
    width: 100%;
    height: 100%;
    position: relative;
    background: transparent;
    padding: var(--page-padding);
    margin: 0;
    overflow: visible;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button {
      position: absolute;
      top: 16px;
      right: 180px;
      background: transparent;
      border: 1px solid var(--border-colour);
      color: var(--text-colour);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background 0.15s, border-color 0.15s;
      z-index: 1001;
    }

    .close-button:hover {
      background: color-mix(in srgb, var(--primary-colour) 40%, transparent);
      border-color: var(--primary-colour);
    }

    .close-button:active {
      background: color-mix(in srgb, var(--primary-colour) 20%, transparent);
    }
</style>