<script lang="ts">
  import Popup from '$components/app/Popup.svelte';
  import Card from '$components/ui/Card.svelte';
  import Close from '$components/ui/Close.svelte';

  export let isOpen: boolean = false;
  export let width: string = '540px';
  export let padding: 'none'| 'small' | 'medium' | 'large' = 'large';
  export let center: boolean = true;
  export let title: string = '';
  export let showClose: boolean = true;
  export let closeOnBackdrop: boolean = true;
  export let onClose: (() => void) | undefined = undefined;
</script>

<Popup {isOpen} {onClose} {closeOnBackdrop}>
  <Card {width} {padding} {center}>
    {#if showClose}
      <Close onClick={onClose} />
    {/if}

    <div class="modal-content">
      {#if title || $$slots.header}
        <div class="modal-header">
          {#if $$slots.header}
            <slot name="header" />
          {:else}
            <h2>{title}</h2>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        <slot />
      </div>

      {#if $$slots.footer}
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      {/if}
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

  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: center;
  }

  .modal-header h2 {
    margin: 0;
    font-size: var(--font-xlarge, 1.75rem);
    font-weight: 700;
    color: var(--text-colour);
  }

  .modal-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .modal-footer {
    display: flex;
    gap: 16px;
    justify-content: center;
    width: 100%;
  }

  .modal-footer :global(.btn) {
    min-width: 140px;
    padding: 12px 24px;
    font-size: var(--font-medium);
  }
</style>