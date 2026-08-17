<script lang="ts">
  export let label: string = '';
  export let type:
    | 'text'
    | 'email'
    | 'hidden'
    | 'number'
    | 'search'
    | 'tel'
    | 'url'
    | 'date'
    | 'datetime-local'
    | 'month'
    | 'time'
    | 'week'
    | 'color' = 'text';
  export let placeholder: string = '';
  export let value: string = '';
  export let error: string = '';
  export let helper: string = '';
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let counter: boolean = false;
  export let maxLength: number | undefined = undefined;
  export let multiline: boolean = false;
  export let id: string = crypto.randomUUID();
  export let centerPlaceholder: boolean = true;

  const validTypes = [
    'text',
    'email',
    'hidden',
    'number',
    'search',
    'tel',
    'url',
    'date',
    'datetime-local',
    'month',
    'time',
    'week',
    'color',
  ];
  $: safeType = validTypes.includes(type) ? type : 'text';

  // Calculate width based on placeholder length
  $: charWidth = 8.5;
  $: bufferPixels = 56; // padding (10px + 14px) + extra buffer
  $: calculatedWidth = placeholder ? `${placeholder.length * charWidth + bufferPixels}px` : 'auto';
</script>

<div class="field">
  {#if label}
    <label for={id}>
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <div class="input-wrap" class:error={!!error} class:disabled class:multiline class:centerPlaceholder style="width: {calculatedWidth}">
    {#if multiline}
      <textarea
        {id}
        {placeholder}
        {disabled}
        {required}
        maxlength={maxLength}
        data-testid="textarea-field"
        bind:value
        on:input
        on:blur
        on:focus
      ></textarea>
    {:else}
      <input
        {id}
        type={safeType}
        {placeholder}
        {disabled}
        {required}
        maxlength={maxLength}
        data-testid="input-field"
        bind:value
        on:input
        on:blur
        on:focus
      />
    {/if}
  </div>

  <div class="counter">
    {#if counter}
      <span class="counter">
        {value.length}{maxLength !== undefined ? ` / ${maxLength}` : ''}
      </span>
    {/if}
  </div>

  {#if error}
    <span class="helper error-text">{error}</span>
  {:else if helper}
    <span class="helper">{helper}</span>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    text-align: left;
    width: 100%;
  }

  label {
    font-size: var(--font-medium);
    font-weight: 400;
    color: var(--text-colour);
  }

  .field:focus-within label {
    color: var(--secondary-colour);
    font-weight: 600;
  }

  .required {
    color: var(--red-error);
    margin-left: 2px;
  }

  .input-wrap {
    display: flex;
    align-items: center;
    background: color-mix(in srgb, var(--secondary-background) 75%, black);
    border: 2px solid color-mix(in srgb, var(--border-colour) 50%, transparent);
    border-radius: 8px;
    transition: border-color 0.35s, box-shadow 0.35s, background 0.35s;
  }

  .input-wrap:focus-within {
    border: 2px solid var(--primary-colour);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-colour) 40%, transparent);
    background: color-mix(in srgb, var(--secondary-background) 80%, white 10%);
  }

  .input-wrap.multiline {
    align-items: flex-start;
    padding: 0;
  }

  .input-wrap.error {
    border-color: var(--red-error);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--red-error) 15%, transparent);
  }

  .input-wrap.disabled {
    background: color-mix(in srgb, var(--secondary-background) 70%, black);
    opacity: 0.6;
    cursor: not-allowed;
  }

  input,
  textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 10px 14px;
    font-size: var(--font-small);
    font-family: var(--font-primary);
    color: var(--text-colour);
    width: 100%;
    caret-color: var(--primary-colour);
  }

  textarea {
    resize: vertical;
    min-height: 160px;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--text-colour);
    opacity: 0.6;
  }

  .input-wrap.centerPlaceholder input::placeholder,
  .input-wrap.centerPlaceholder textarea::placeholder {
    text-align: center;
  }

  .input-wrap.centerPlaceholder input,
  .input-wrap.centerPlaceholder textarea {
    text-align: center;
  }

  input:disabled,
  textarea:disabled {
    cursor: not-allowed;
  }

  .helper {
    font-size: var(--font-small);
    font-weight: 400;
    color: var(--text-colour);
  }

  .error-text {
    color: var(--red-error);
  }

  .counter {
    color: var(--text-colour);
    font-size: var(--font-small);
    opacity: 0.8;
  }
</style>