<script lang="ts">
  import Input from "$components/ui/Input.svelte";
  import { personData, updatePersonData } from "$stores";

  // Type-safe helper for standard text/date inputs
  function handleInput(field: keyof typeof $personData, e: Event) {
    const target = e.currentTarget as HTMLInputElement | null;
    if (!target) return;
    const val = target.value;
    updatePersonData({ [field]: val === "" ? null : val });
  }

  // Type-safe helper specifically for textareas
  function handleTextareaInput(field: keyof typeof $personData, e: Event) {
    const target = e.currentTarget as HTMLTextAreaElement | null;
    if (!target) return;
    updatePersonData({ [field]: target.value });
  }
</script>

<div class="overview-container">
  <div class="row-three-col">
    <Input
      label="First Name"
      placeholder="e.g. Margaret"
      value={$personData.firstName}
      on:input={(e) => handleInput('firstName', e)}
      centerPlaceholder={false}
    />
    <Input
      label="Middle Name(s)"
      placeholder="e.g. Anne Mary"
      value={$personData.middleNames}
      on:input={(e) => handleInput('middleNames', e)}
      centerPlaceholder={false}
    />
    <Input
      label="Surname"
      placeholder="e.g. Smith"
      value={$personData.lastName}
      on:input={(e) => handleInput('lastName', e)}
      centerPlaceholder={false}
    />
  </div>

  <div class="row-two-col">
    <div class="life-event-group">
      <span class="group-label">Birth Information</span>
      <div class="group-inputs">
        <Input
          label="Date of Birth"
          placeholder="e.g. 14 May 1892 or c. 1890"
          value={$personData.dob ?? ""}
          on:input={(e) => handleInput('dob', e)}
          centerPlaceholder={false}
        />
        <Input
          label="Birth Location"
          placeholder="Town, County, Country"
          value={$personData.birthLocation}
          on:input={(e) => handleInput('birthLocation', e)}
          centerPlaceholder={false}
        />
      </div>
    </div>

    <div class="life-event-group">
      <span class="group-label">Death Information</span>
      <div class="group-inputs">
        <Input
          label="Date of Death"
          placeholder="e.g. 21 Oct 1965"
          value={$personData.dod ?? ""}
          on:input={(e) => handleInput('dod', e)}
          centerPlaceholder={false}
        />
        <Input
          label="Death Location"
          placeholder="Town, County, Country"
          value={$personData.deathLocation}
          on:input={(e) => handleInput('deathLocation', e)}
          centerPlaceholder={false}
        />
      </div>
    </div>
  </div>

  <div class="field-biography">
    <Input
      label="Biography & Important Notes"
      placeholder="Add military service, occupations, nicknames, or notable achievements..."
      value={$personData.keyFacts}
      on:input={(e) => handleTextareaInput('keyFacts', e)}
      multiline={true}
      centerPlaceholder={false}
    />
  </div>
</div>

<style>
  .overview-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  .row-three-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }

  .row-two-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    width: 100%;
  }

  .life-event-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .group-label {
    font-size: var(--font-small);
    font-weight: 600;
    color: var(--text-colour);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: left;
    border-bottom: 1px solid color-mix(in srgb, var(--border-colour) 40%, transparent);
    padding-bottom: 6px;
    margin-bottom: 4px;
    opacity: 0.7;
  }

  .group-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field-biography {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 8px;
  }

  :global(.overview-container .field) {
    width: 100% !important;
  }

  :global(.overview-container .input-wrap) {
    width: 100% !important;
  }

  :global(.field-biography .field) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(.field-biography .input-wrap.multiline) {
    flex: 1;
    display: flex;
  }

  :global(.field-biography textarea) {
    height: 100% !important;
    min-height: 120px;
    resize: none;
  }
</style>