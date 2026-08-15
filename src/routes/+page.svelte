<script lang="ts">
    import Button from '$components/ui/Button.svelte';
    import Tree_container from '$components/app/Tree_container.svelte';
    import { IconTree } from '@tabler/icons-svelte-runes';

    import Popup from '$components/app/Popup.svelte';
</script>

<Popup isOpen={true}>
    <Button>Test</Button>
</Popup>
<Tree_container />