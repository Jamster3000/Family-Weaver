<script lang="ts">
  import Popup from '$components/app/Popup.svelte';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';
  import Close from '$components/ui/Close.svelte';

  export let isOpen: boolean = false;

  function handleClose() {
    isOpen = false;
  }
</script>

<Popup {isOpen}>
  <Card width="540px" padding="large" center={true}>
    <Close onClick={handleClose} />

    <div class="modal-content">
      <h2>What's New</h2>

      <div class="content-body">
        <slot />
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
    gap: 1.25rem;
    width: 100%;
  }

  h2 {
    margin: 0;
    font-size: var(--font-xlarge, 1.75rem);
    font-weight: 700;
    color: var(--text-colour);
  }

  .content-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-height: 350px;
    overflow-y: auto;
    padding-right: 4px;
    text-align: left;
    color: var(--text-colour);
    font-size: var(--font-medium);
    opacity: 0.9;
  }

  .actions {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 0.5rem;
  }

  .actions :global(.btn) {
    min-width: 160px;
  }
</style>