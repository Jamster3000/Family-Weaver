<script lang="ts">
  import Card from "$components/ui/Card.svelte";
  import Button from "$components/ui/Button.svelte";
  import TimelineEntryForm from "./TimelineEntryForm.svelte";
  import { personData, updatePersonData } from "$personStore";
  import { IconArrowLeft, IconTrash, IconPlus } from "@tabler/icons-svelte-runes";

  type CategoryKey = 'lifeEvents' | 'workEducation' | 'placesLived';

  export let categoryKey: CategoryKey;
  export let categoryTitle: string = '';
  export let onBack: () => void;

  export let isAddingEntry = false;

  $: entries = $personData?.[categoryKey] ?? [];
  $: displayTitle = categoryTitle?.toLowerCase() ?? 'this category';

  function handleDeleteEntry(id: string) {
    const updated = entries.filter((item) => item.id !== id);
    updatePersonData({ [categoryKey]: updated });
  }
</script>

{#if isAddingEntry}
  <TimelineEntryForm
    {categoryKey}
    {categoryTitle}
    onCancel={() => isAddingEntry = false}
    onSave={() => isAddingEntry = false}
  />
{:else}
  <div class="category-view-wrapper">
    <div class="view-header">
      <button class="back-btn" on:click={onBack} aria-label="Back to categories">
        <IconArrowLeft size={20} stroke={1.5} />
        <span>Back to Categories</span>
      </button>

      <h2>{categoryTitle}</h2>

      <Button on:click={() => isAddingEntry = true}>
        <IconPlus size={18} stroke={2} />
        <span>Add Entry</span>
      </Button>
    </div>

    <div class="entries-container">
      {#if entries.length === 0}
        <Card width="100%" padding="medium">
          <div class="empty-state">
            <p class="empty-title">No entries added yet</p>
            <p class="empty-sub">Click "+ Add Entry" to record a milestone for {displayTitle}.</p>
          </div>
        </Card>
      {:else}
        <div class="entries-list">
          {#each entries as entry (entry.id)}
            <Card width="100%" padding="small">
              <div class="entry-item">
                <div class="entry-details">
                  <span class="entry-title">{entry.title}</span>
                  <span class="entry-dates">
                    {entry.startDate || 'Date unknown'}
                    {entry.endDate ? ` – ${entry.endDate}` : ''}
                  </span>
                  {#if entry.description}
                    <p class="entry-description">{entry.description}</p>
                  {/if}
                </div>

                <button
                  class="delete-btn"
                  on:click={() => handleDeleteEntry(entry.id)}
                  title="Delete entry"
                  aria-label="Delete entry"
                >
                  <IconTrash size={18} stroke={1.5} />
                </button>
              </div>
            </Card>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .category-view-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: 100%;
  }

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .view-header h2 {
    font-size: var(--font-large);
    font-weight: 600;
    color: var(--text-colour);
    margin: 0;
  }

  .back-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-colour);
    font-size: var(--font-small);
    font-weight: 600;
    cursor: pointer;
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  .entries-container {
    flex: 1;
    overflow-y: auto;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .entry-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }

  .entry-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .entry-title {
    font-size: var(--font-medium);
    font-weight: 600;
    color: var(--text-colour);
  }

  .entry-dates {
    font-size: var(--font-small);
    color: var(--primary-colour);
    font-weight: 500;
  }

  .entry-description {
    font-size: var(--font-small);
    color: var(--text-colour);
    opacity: 0.8;
    margin: 4px 0 0 0;
    line-height: 1.4;
  }

  .delete-btn {
    all: unset;
    cursor: pointer;
    color: var(--red-error, #ff4d4f);
    padding: 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .delete-btn:hover {
    opacity: 1;
  }

  .empty-state {
    text-align: center;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .empty-title {
    font-size: var(--font-medium);
    font-weight: 600;
    color: var(--text-colour);
    margin: 0;
  }

  .empty-sub {
    font-size: var(--font-small);
    color: var(--text-colour);
    opacity: 0.7;
    margin: 0;
  }
</style>