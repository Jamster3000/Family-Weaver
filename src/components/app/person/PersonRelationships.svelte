<script lang="ts">
  import { personData, updatePersonData } from "$personStore";
  import { personTreeStore } from "$personTreeStore";
  import { IconUser, IconUsers, IconHeart, IconTrash } from "@tabler/icons-svelte-runes";

  function formatName(person: { firstName?: string; lastName?: string }): string {
    const name = [person.firstName, person.lastName].filter(Boolean).join(" ");
    return name || "Unnamed Person";
  }

  let peopleById = $derived(
    new Map($personTreeStore.map((p) => [p.id, p]))
  );

  function handleAddRelation(
    field: "parentIds" | "childrenIds" | "partnerIds",
    e: Event
  ) {
    const select = e.currentTarget as HTMLSelectElement | null;
    if (!select || !select.value) return;

    const selectedId = select.value;
    const currentList = $personData[field] || [];

    if (!currentList.includes(selectedId)) {
      updatePersonData({ [field]: [...currentList, selectedId] });
    }

    select.value = "";
  }

  function handleRemoveRelation(
    field: "parentIds" | "childrenIds" | "partnerIds",
    idToRemove: string
  ) {
    const currentList = $personData[field] || [];
    updatePersonData({
      [field]: currentList.filter((id) => id !== idToRemove),
    });
  }
</script>

<div class="relationships-container">
  <div class="relation-group">
    <div class="group-header">
      <IconUser size={24} />
      <h2 class="group-title">Parents</h2>
    </div>

    <div class="group-content">
      <div class="add-select-wrapper">
        <select
          class="add-select"
          onchange={(e) => handleAddRelation("parentIds", e)}
          value=""
          aria-label="Add a parent"
        >
          <option value="" disabled>Add parent</option>
          {#each $personTreeStore as person}
            {#if !$personData.parentIds.includes(person.id)}
              <option value={person.id}>{formatName(person)}</option>
            {/if}
          {/each}
        </select>
      </div>

      {#if $personData.parentIds.length === 0}
        <p class="empty-state">No parents added</p>
      {:else}
        <div class="relations-list">
          {#each $personData.parentIds as parentId}
            {@const person = peopleById.get(parentId)}
            <div class="relation-item">
              <span class="relation-name">{person ? formatName(person) : "Unknown"}</span>
              <button
                type="button"
                class="remove-btn"
                onclick={() => handleRemoveRelation("parentIds", parentId)}
                aria-label="Remove {formatName(person || {})}"
                title="Remove {formatName(person || {})}"
              >
                <IconTrash size={18} /> Remove
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="divider"></div>

  <div class="relation-group">
    <div class="group-header">
      <IconUsers size={24} />
      <h2 class="group-title">Children</h2>
    </div>

    <div class="group-content">
      <div class="add-select-wrapper">
        <select
          class="add-select"
          onchange={(e) => handleAddRelation("childrenIds", e)}
          value=""
          aria-label="Add a child"
        >
          <option value="" disabled>Add child</option>
          {#each $personTreeStore as person}
            {#if !$personData.childrenIds.includes(person.id)}
              <option value={person.id}>{formatName(person)}</option>
            {/if}
          {/each}
        </select>
      </div>

      {#if $personData.childrenIds.length === 0}
        <p class="empty-state">No children added</p>
      {:else}
        <div class="relations-list">
          {#each $personData.childrenIds as childId}
            {@const person = peopleById.get(childId)}
            <div class="relation-item">
              <span class="relation-name">{person ? formatName(person) : "Unknown"}</span>
              <button
                type="button"
                class="remove-btn"
                onclick={() => handleRemoveRelation("childrenIds", childId)}
                aria-label="Remove {formatName(person || {})}"
                title="Remove {formatName(person || {})}"
              >
                <IconTrash size={18} /> Remove
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="divider"></div>

  <div class="relation-group">
    <div class="group-header">
      <IconHeart size={24} />
      <h2 class="group-title">Partners</h2>
    </div>

    <div class="group-content">
      <div class="add-select-wrapper">
        <select
          class="add-select"
          onchange={(e) => handleAddRelation("partnerIds", e)}
          value=""
          aria-label="Add a partner"
        >
          <option value="" disabled>Add partner</option>
          {#each $personTreeStore as person}
            {#if !$personData.partnerIds.includes(person.id)}
              <option value={person.id}>{formatName(person)}</option>
            {/if}
          {/each}
        </select>
      </div>

      {#if $personData.partnerIds.length === 0}
        <p class="empty-state">No partners added</p>
      {:else}
        <div class="relations-list">
          {#each $personData.partnerIds as partnerId}
            {@const person = peopleById.get(partnerId)}
            <div class="relation-item">
              <span class="relation-name">{person ? formatName(person) : "Unknown"}</span>
              <button
                type="button"
                class="remove-btn"
                onclick={() => handleRemoveRelation("partnerIds", partnerId)}
                aria-label="Remove {formatName(person || {})}"
                title="Remove {formatName(person || {})}"
              >
                <IconTrash size={18} /> Remove
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .relationships-container {
    display: grid;
    grid-template-columns: 1fr 1px 1fr 1px 1fr;
    gap: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .divider {
    width: 1px;
    background: color-mix(in srgb, var(--primary-colour) 20%, transparent);
    margin: 0;
  }

  .relation-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 20px;
    height: 100%;
    overflow: hidden;
    min-width: 0;
  }

  .relation-group:first-child {
    padding-left: 20px;
  }

  .relation-group:last-child {
    padding-right: 20px;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    padding-top: 0;
  }

  .group-title {
    font-size: var(--font-large);
    font-weight: 600;
    color: var(--text-colour);
    margin: 0;
    padding: 0;
  }

  .group-header :global(svg) {
    color: var(--primary-colour);
    flex-shrink: 0;
  }

  .group-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow: hidden;
  }

  .add-select-wrapper {
    flex-shrink: 0;
  }

  .add-select {
    width: 100%;
    padding: 12px 12px;
    background: var(--secondary-background);
    border: 1px solid var(--border-colour);
    border-radius: 4px;
    color: var(--text-colour);
    font-size: var(--font-small);
    font-family: inherit;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
    min-height: 44px;
  }

  .add-select:focus {
    border-color: var(--primary-colour);
  }

  .add-select option {
    background: var(--secondary-background);
    color: var(--text-colour);
    padding: 8px;
  }

  .empty-state {
    font-size: var(--font-medium);
    color: var(--text-colour);
    opacity: 0.45;
    margin: 0;
    padding: 0;
  }

  .relations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
    min-height: 0;
  }

  .relations-list::-webkit-scrollbar {
    width: 6px;
  }

  .relations-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .relations-list::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--primary-colour) 30%, transparent);
    border-radius: 3px;
  }

  .relations-list::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--primary-colour) 50%, transparent);
  }

  .relation-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--primary-colour) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--primary-colour) 25%, transparent);
    border-radius: 4px;
    gap: 10px;
    flex-shrink: 0;
  }

  .relation-name {
    font-size: var(--font-medium);
    color: var(--text-colour);
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: var(--text-colour);
    cursor: pointer;
    padding: 4px;
    opacity: 0.55;
    transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--red-error) 20%, transparent);
    color: var(--red-error);
  }

  .remove-btn :global(svg) {
    display: block;
  }
</style>