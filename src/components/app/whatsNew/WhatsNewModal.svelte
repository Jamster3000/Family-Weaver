<script lang="ts">
  import Modal from '$components/ui/Modal.svelte';
  import Button from '$components/ui/Button.svelte';
  import { whatsNewModal, modals } from '$modalStore';
  import { marked } from 'marked';

  let version: string = '';
  let releaseNotes: string = '';

  //When the modal opens, reread the localstorage as the version number cached is
  //updated after the modal reads the data originally.
  $: if ($whatsNewModal) {
    version = localStorage.getItem('cached_release_version') || '';
    releaseNotes = localStorage.getItem('cached_release_notes') || '';
  }

  function handleClose() {
    modals.close('whatsNew');
  }

  $: renderedNotes = releaseNotes ? marked.parse(releaseNotes) : '';
</script>

<Modal isOpen={$whatsNewModal} width="720px" onClose={handleClose}>
  <svelte:fragment slot="header">
    <h2>What's New</h2>
    {#if version}
      <span class="version-badge">Version {version}</span>
    {/if}
  </svelte:fragment>

  <div class="content-box">
    <div class="content-body">
      {#if renderedNotes}
        {@html renderedNotes}
      {:else}
        <slot />
      {/if}
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button variant="primary" type="button" on:click={handleClose}>
      Got it
    </Button>
  </svelte:fragment>
</Modal>

<style>
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

  :global(.content-body ul) {
    margin: 0;
    padding-left: 20px;
    list-style-type: disc;
  }

  :global(.content-body ul li) {
    margin: 6px 0;
    color: var(--text-colour);
  }

  :global(.content-body ol) {
    margin: 0;
    padding-left: 20px;
    list-style-type: decimal;
  }

  :global(.content-body ol li) {
    margin: 6px 0;
    color: var(--text-colour);
  }

  :global(.content-body h1),
  :global(.content-body h2),
  :global(.content-body h3) {
    color: var(--text-colour);
    margin: 12px 0 6px 0;
  }

  :global(.content-body h1) {
    font-size: var(--font-large);
    font-weight: 700;
  }

  :global(.content-body h2) {
    font-size: var(--font-medium);
    font-weight: 700;
  }

  :global(.content-body h3) {
    font-size: var(--font-small);
    font-weight: 600;
  }

  :global(.content-body a) {
    color: var(--primary-colour);
    text-decoration: none;
  }

  :global(.content-body a:hover) {
    text-decoration: underline;
  }

  :global(.content-body code) {
    background: var(--code-background);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }

  :global(.content-body pre) {
    background: var(--code-background);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 8px 0;
  }
</style>