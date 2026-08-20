<script lang="ts">
    import { IconSparkles } from '@tabler/icons-svelte-runes';
    import Button from '$components/ui/Button.svelte';
    import WhatsNewModal from '$components/app/whatsNew/WhatsNewModal.svelte';

    let isModalOpen: boolean = false;
</script>

<WhatsNewModal bind:isOpen={isModalOpen} />

<Button variant="secondary" on:click={() => (isModalOpen = true)} ariaLabel="What's New">
    <IconSparkles size={28} />
    <span>What's New</span>
</Button>