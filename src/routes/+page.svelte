<script lang="ts">
    import Create_tree from '$components/app/Create_tree.svelte';
    import { onMount } from 'svelte';
    import { invoke } from '@tauri-apps/api/core';
    import { goto } from '$app/navigation';

    let open_popup: boolean = false;

    async function checkTreeExists() {
        try {
            const exists = await invoke('check_tree_exists');
            if (exists) {
                open_popup = false;
                goto('/tree');
            } else {
                open_popup = true;
            }
        } catch (error) {
            console.error('Error checking if family tree exists:', error);
            return false;
        }
    }

    onMount(() => {
        checkTreeExists();
    });
</script>

<Create_tree firstTime={true} open_popup={open_popup} />