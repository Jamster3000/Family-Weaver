<script lang="ts">
  import Popup from '$components/app/Popup.svelte';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';
  import Close from '$components/ui/Close.svelte';
  import { marked } from 'marked';
  import { onMount } from 'svelte';

  export let isOpen: boolean = false;

  let version: string = '';
  let releaseNotes: string = '';

  onMount(() => {
    version = localStorage.getItem('cached_release_version') || '';
    releaseNotes = localStorage.getItem('cached_release_notes') || '';
  });

  function handleClose() {
    isOpen = false;
  }

  $: renderedNotes = releaseNotes ? marked(releaseNotes) : '';
</script>

<Popup {isOpen}>
  <Card width="720px" padding="large" center={true}>
    <Close onClick={handleClose} />

    <div class="modal-content">
      <div class="header-area">
        <h2>What's New</h2>
        {#if version}
          <span class="version-badge">Version {version}</span>
        {/if}
      </div>

      <div class="content-box">
        <div class="content-body">
          {#if renderedNotes}
            {@html renderedNotes}
          {:else}
            <slot />
          {/if}
        </div>
      </div>

      <div class="actions">
        <Button variant="primary" type="button" on:click={handleClose}>
          Got it
        </Button>
      </div>
    </div>
  </Card>
</Popup>

<style>
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
  }

  .header-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: center;
  }

  h2 {
    margin: 0;
    font-size: var(--font-xlarge, 2rem);
    font-weight: 700;
    color: var(--text-colour);
  }

  .version-badge {
    background: color-mix(in srgb, var(--primary-colour) 10%, var(--secondary-background));
    border: 1px solid var(--border-colour);
    color: var(--text-colour);
    padding: 4px 14px;
    border-radius: 20px;
    font-size: var(--font-small);
    font-weight: 500;
    opacity: 0.85;
  }

  .content-box {
    width: 100%;
    background: var(--primary-background);
    border: 1px solid var(--border-colour);
    border-radius: 12px;
    padding: 20px;
    box-sizing: border-box;
  }

  .content-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 420px;
    overflow-y: auto;
    padding-right: 8px;
    text-align: left;
    color: var(--text-colour);
    font-size: var(--font-medium);
    line-height: 1.6;
  }

  .actions {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .actions :global(.btn) {
    min-width: 180px;
    padding: 12px 24px;
    font-size: var(--font-medium);
  }
</style>