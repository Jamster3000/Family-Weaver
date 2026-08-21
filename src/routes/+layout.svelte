<script lang="ts">
    import '../app.css';
    import { navigating } from '$app/stores';
    import { fade } from 'svelte/transition';
    import Titlebar from '$components/app/Titlebar.svelte';
</script>

<Titlebar />

<!-- Any page navigation will have a fade transition -->
{#key $navigating?.to?.url.pathname}
  <div in:fade={{ duration: 550 }}>
    <slot />
  </div>
{/key}