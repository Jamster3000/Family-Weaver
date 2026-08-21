<script lang="ts">
  import Popup from '$components/app/Popup.svelte';
  import Card from '$components/ui/Card.svelte';
  import Button from '$components/ui/Button.svelte';

  export let isOpen: boolean = false;
  export let version: string = '';
  export let onUpdate: () => void = () => {};
  export let onDismiss: () => void = () => {};
</script>

<Popup bind:isOpen>
  <Card width="540px" padding="large" center={true}>
    <div class="modal-content">
      <h2>Software Update Available</h2>

      <div class="content-box">
        <p>
          {#if version}
            Version {version} is now available for Family Weaver.
          {:else}
            A new version is available for Family Weaver.
          {/if}
          Would you like to install this update now?
        </p>
      </div>

      <div class="actions">
        <Button variant="secondary" type="button" on:click={onDismiss}>
          Later
        </Button>
        <Button variant="primary" type="button" on:click={onUpdate}>
          Update Now
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
    text-align: center;
  }

  h2 {
    margin: 0;
    font-size: var(--font-xlarge, 1.75rem);
    font-weight: 700;
    color: var(--text-colour);
  }

  .content-box {
    width: 100%;
    background: var(--primary-background);
    border: 1px solid var(--border-colour);
    border-radius: 12px;
    padding: 20px;
    box-sizing: border-box;
  }

  p {
    margin: 0;
    color: var(--text-colour);
    font-size: var(--font-medium);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    width: 100%;
  }

  .actions :global(.btn) {
    min-width: 140px;
    padding: 12px 24px;
    font-size: var(--font-medium);
  }
</style>