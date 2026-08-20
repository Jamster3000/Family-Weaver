<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { IconSitemap, IconCheck } from '@tabler/icons-svelte-runes';
  import Popup from '$components/app/Popup.svelte';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';
  import Close from '$components/ui/Close.svelte';

  export let isOpen: boolean = false;
  export let activeTreeId: string = '';

  let trees: Array<{
    id: string;
    name: string;
    active_tree: number;
    updated_at: string;
  }> = [];

  $: if (isOpen) {
    fetchTrees();
  }

  async function fetchTrees() {
    try {
      trees = await invoke('get_all_trees');
    } catch (error) {
      console.error('Failed to load trees:', error);
    }
  }

  async function handleSelectTree(treeId: string) {
    if (treeId === activeTreeId) {
      isOpen = false;
      return;
    }

    try {
      await invoke('switch_active_tree', { treeId });
      isOpen = false;
    } catch (error) {
      console.error('Failed to switch active tree:', error);
    }
  }

  function handleClose() {
    isOpen = false;
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
</script>

<Popup {isOpen}>
  <Card width="90%" padding="large" center={true}>
    <Close onClick={handleClose} />

    <div class="modal-content">
      <div class="header-text">
        <h2>Switch Family Tree</h2>
        <p class="subtitle">Select the family tree you would like to view or edit:</p>
      </div>

      <div class="tree-grid">
        {#each trees as tree}
          <button
            type="button"
            class="tree-card"
            class:active={tree.id === activeTreeId || tree.active_tree === 1}
            on:click={() => handleSelectTree(tree.id)}
          >
            <div class="tree-card-header">
              <div class="icon-wrapper">
                <IconSitemap size={28} />
              </div>
              {#if tree.id === activeTreeId || tree.active_tree === 1}
                <span class="badge">
                  <IconCheck size={16} /> Active
                </span>
              {/if}
            </div>

            <div class="tree-card-body">
              <span class="tree-name">{tree.name}</span>
              <span class="tree-date">Last updated: {formatDate(tree.updated_at)}</span>
            </div>
          </button>
        {:else}
          <div class="empty-state">
            <p class="empty-text">Loading trees...</p>
          </div>
        {/each}
      </div>

      <div class="actions">
        <Button variant="secondary" type="button" on:click={handleClose}>
          Cancel
        </Button>
      </div>
    </div>
  </Card>
</Popup>

<style>
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
  }

  .header-text {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: var(--font-xlarge, 1.75rem);
    font-weight: 700;
    color: var(--text-colour);
  }

  .subtitle {
    margin: 0;
    font-size: var(--font-medium);
    color: var(--text-colour);
    opacity: 0.8;
  }

  .tree-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.90rem;
    width: 100%;
    max-height: 60vh;
    overflow-y: auto;
    padding: 0.25rem;
  }

  .tree-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    background: color-mix(in srgb, var(--secondary-background) 80%, black);
    border: 2px solid var(--border-colour);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .tree-card:hover {
    border-color: var(--primary-colour);
    background: color-mix(in srgb, var(--primary-colour) 8%, var(--secondary-background));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tree-card.active {
    border-color: var(--primary-colour);
    background: color-mix(in srgb, var(--primary-colour) 15%, var(--secondary-background));
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-colour) 20%, transparent);
  }

  .tree-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--border-colour) 50%, transparent);
    color: var(--text-colour);
    padding: 0.5rem;
    border-radius: 8px;
  }

  .tree-card.active .icon-wrapper {
    background: var(--primary-colour);
    color: var(--secondary-background);
  }

  .tree-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tree-name {
    font-size: var(--font-large, 1.25rem);
    font-weight: 600;
    color: var(--text-colour);
    word-break: break-word;
  }

  .tree-date {
    font-size: var(--font-small);
    color: var(--text-colour);
    opacity: 0.7;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--font-small);
    font-weight: 700;
    background: var(--primary-colour);
    color: var(--secondary-background);
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 3rem 0;
  }

  .empty-text {
    font-size: var(--font-medium);
    opacity: 0.6;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 1rem;
  }

  .actions :global(.btn) {
    min-width: 200px;
  }
</style>