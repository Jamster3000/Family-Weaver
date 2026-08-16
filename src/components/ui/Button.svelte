<script lang="ts">
  export let href: string | undefined = undefined;
  export let variant: 'primary' | 'secondary' | 'transparent' = 'primary';
  export let type: 'button' | 'submit' = 'button';
  export let disabled: boolean = false;
  export let fontSize: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  export let iconOnly: boolean = false;
  export let ariaLabel: string = '';
</script>

{#if href}
  <a {href} class="btn {variant} {fontSize}" class:disabled class:iconOnly aria-label={ariaLabel || 'Link'}>
    <span class="btn-text"><slot /></span>
  </a>
{:else}
  <button {type} {disabled} class="btn {variant} {fontSize}" class:iconOnly on:click aria-label={ariaLabel || 'Button'}>
    <span class="btn-text"><slot /></span>
  </button>
{/if}

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    font-family: var(--font-primary);
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.15s ease;
    will-change: background-color, box-shadow, transform;
  }

  .btn.iconOnly {
    padding: 4px;
    border-radius: 6px;
  }

  .transparent.iconOnly {
    padding: 2px;
  }

  .btn-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .primary {
    background: var(--primary-colour);
    color: var(--text-colour);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 1px solid var(--primary-colour);
  }

  .primary:hover:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--primary-colour) 88%, black);
    border-color: color-mix(in srgb, var(--primary-colour) 88%, black);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  }

  .primary:active:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--primary-colour) 80%, black);
    border-color: color-mix(in srgb, var(--primary-colour) 80%, black);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
    transform: scale(0.99);
  }

  .primary:focus-visible {
    outline: 2px solid var(--secondary-colour);
    outline-offset: 2px;
  }

  .secondary {
    background: transparent;
    color: var(--secondary-colour);
    font-weight: 800px;
    border: 2.5px solid var(--secondary-colour);
    box-shadow: none;
  }

  .secondary:hover:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--secondary-colour) 10%, transparent);
    border-color: var(--secondary-colour);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .secondary:active:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--secondary-colour) 14%, transparent);
    border-color: var(--secondary-colour);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    transform: scale(0.99);
  }

  .secondary:focus-visible {
    outline: 2px solid var(--secondary-colour);
    outline-offset: 2px;
  }

  .transparent {
    background: transparent;
    color: var(--text-colour);
    border: 1px solid transparent;
    box-shadow: none;
  }

  .transparent:hover:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--secondary-colour) 10%, transparent);
    border-color: var(--secondary-colour);
  }

  .transparent:active:not(.disabled):not(:disabled) {
    background: color-mix(in srgb, var(--secondary-colour) 10%, transparent);
    transform: scale(0.99);
  }

  .transparent:focus-visible {
    outline: 2px solid var(--secondary-colour);
    outline-offset: 2px;
  }

  .btn:disabled,
  .btn.disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .xsmall { font-size: var(--font-xsmall); }
  .small { font-size: var(--font-small); }
  .medium { font-size: var(--font-medium); }
  .large { font-size: var(--font-large); }
  .xlarge { font-size: var(--font-xlarge); }
</style>