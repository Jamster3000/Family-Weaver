<script lang="ts">
  export let padding: 'none' | 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  export let width: string = '100%'; //Can be set to auto for it to work its own width out based on content.
  export let height: string = 'auto'; //Can be set to auto for it to work its own height out based on content.
  export let center: boolean = true;
  export let variant: 'default' = 'default';
</script>

<div class="card {padding} {variant}" class:center style="--card-width: {width}; --card-height: {height};">
  <slot />
</div>

<style>
  :root {
    --card-width: 100%;
    --card-height: auto;
  }

  .card {
    width: var(--card-width);
    height: var(--card-height);
    border-radius: 12px;
    border: 1px solid var(--border-colour);
    color: var(--text-colour);
  }

  .card.center {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .default {
    background: var(--secondary-background);
  }

  .none {
    padding: 0;
  }

  .small {
    padding: 1.5rem;
  }

  .medium {
    padding: 2rem;
  }

  .large {
    padding: 2.5rem;
  }

  .xlarge {
    padding: 4rem;
  }
</style>