<script lang="ts">
  import CreateTree from '$components/app/toolbarActions/CreateTree.svelte';
  import TreeSpinner from '$components/ui/TreeSpinner.svelte';
  import UpdateModal from '$components/app/UpdateModal.svelte';
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { goto } from '$app/navigation';
  import { checkForAppUpdates, installUpdate } from '$lib/CheckForUpdates';
  import type { Update } from '@tauri-apps/plugin-updater';

  let open_popup: boolean = false;
  let updateModalOpen: boolean = false;
  let updateVersion: string = '';
  let updateObject: Update | null = null;
  let showSpinner = true;
  let hangAtEnd = false;
  let spinnerText = 'Checking for updates...';

  async function checkTreeExists() {
    try {
      const exists = await invoke<boolean>('check_tree_exists');
      if (exists) {
        open_popup = false;
        await goto('/tree');
      } else {
        open_popup = true;
        showSpinner = false;
      }
    } catch (error) {
      console.error('Error checking if family tree exists:', error);
      showSpinner = false;
    }
  }

  onMount(async () => {
    try {
      const update = await checkForAppUpdates();

      if (update) {
        updateVersion = update.version;
        updateObject = update;
        showSpinner = false;
        updateModalOpen = true;
        return;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }

    await checkTreeExists();
  });

  async function handleUpdateNow() {
    if (!updateObject) return;

    updateModalOpen = false;
    showSpinner = true;
    spinnerText = "Installing update...";
    hangAtEnd = true;

    try {
      await installUpdate(updateObject);
    } catch (error) {
      console.error('Error installing update:', error);
      showSpinner = false;
      await checkTreeExists();
    }
  }

  function handleDismissUpdate() {
    updateModalOpen = false;
    showSpinner = false;
    checkTreeExists();
  }
</script>

<TreeSpinner
  bind:isVisible={showSpinner}
  loadingText={spinnerText}
  {hangAtEnd}/>

<UpdateModal
  bind:isOpen={updateModalOpen}
  version={updateVersion}
  onUpdate={handleUpdateNow}
  onDismiss={handleDismissUpdate}
/>

<CreateTree firstTime={true} open_popup={open_popup} />