<script lang="ts">
    import { IconSparkles } from '@tabler/icons-svelte-runes';
    import Button from '$components/ui/Button.svelte';
    import WhatsNewModal from '$components/app/whatsNew/WhatsNewModal.svelte';
    import { modals } from '$modalStore';
</script>

<WhatsNewModal />

<Button variant="secondary" on:click={() => modals.open('whatsNew')} ariaLabel="What's New">
    <IconSparkles size={28} />
    <span>What's New</span>
</Button>