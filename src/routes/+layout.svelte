<script lang="ts">
    import '../app.css';
    import { navigating } from '$app/stores';
    import { fade } from 'svelte/transition';
</script>

{#key $navigating?.to?.url.pathname}
  <div in:fade={{ duration: 550 }}>
    <slot />
  </div>
{/key}