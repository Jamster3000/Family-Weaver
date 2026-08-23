<script lang="ts">
  import Modal from '$components/ui/Modal.svelte';
  import Button from '$components/ui/Button.svelte';

  export let isOpen: boolean = false;
  export let version: string = '';
  export let onUpdate: () => void = () => {};
  export let onDismiss: () => void = () => {};

  function handleClose() {
    isOpen = false;
    onDismiss();
  }
</script>

<Modal {isOpen} width="540px" onClose={handleClose}>
  <svelte:fragment slot="header">
    <h2>Software Update Available</h2>
  </svelte:fragment>

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

  <svelte:fragment slot="footer">
    <Button variant="secondary" type="button" on:click={handleClose}>
      Later
    </Button>
    <Button variant="primary" type="button" on:click={onUpdate}>
      Update Now
    </Button>
  </svelte:fragment>
</Modal>

<style>
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
</style>