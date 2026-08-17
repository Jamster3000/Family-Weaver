<script lang="ts">
    import Card from '$components/ui/Card.svelte';
    import Popup from '$components/app/Popup.svelte';
    import Close from '$components/ui/Close.svelte';

    export let isOpen: boolean = false;

    function handleClose() {
        isOpen = false;
    }
</script>

<Popup isOpen={isOpen} closeOnBackdrop={true}>
    <Card width="100%" padding="small">
        <Close onClick={() => (isOpen = false)} />
        <h1> Welcome to Family Weaver</h1>

        <p>Family Weaver helps you build and visualize your family tree. Add members, track relationships, and explore your genealogy—all offline, no limits.</p>

        <p>Let's create your first family tree to get started.</p>
    </Card>
</Popup>