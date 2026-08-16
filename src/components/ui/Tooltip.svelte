<script lang="ts">
  import { fade } from 'svelte/transition';

  export let text: string = '';
  export let delay: number = 350;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  let isVisible = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  let wrapperNode: HTMLDivElement;
  let tooltipTop = 0;
  let tooltipLeft = 0;

  function updatePosition() {
    if (!isVisible || !wrapperNode) return;

    const target = wrapperNode.firstElementChild as HTMLElement;
    if (!target) return;

    const rect = target.getBoundingClientRect();

    if (position === 'top') {
      tooltipTop = rect.top;
      tooltipLeft = rect.left + rect.width / 2;
    } else if (position === 'bottom') {
      tooltipTop = rect.bottom;
      tooltipLeft = rect.left + rect.width / 2;
    } else if (position === 'left') {
      tooltipTop = rect.top + rect.height / 2;
      tooltipLeft = rect.left;
    } else if (position === 'right') {
      tooltipTop = rect.top + rect.height / 2;
      tooltipLeft = rect.right;
    }
  }

  function showTooltip() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isVisible = true;
      updatePosition();
    }, delay);
  }

  function hideTooltip() {
    clearTimeout(timeoutId);
    isVisible = false;
  }

  //takes the tooltip out of the DOM hierachy and puts it in the body level
  // this is required so the the child elements contained in the tooltip can have transform CSS and other
  // transformitive positioning without affecting the tooltip's position and calculations.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    };
  }
</script>

<svelte:window
  on:scroll|capture={updatePosition}
  on:resize={updatePosition}
/>

<div
  bind:this={wrapperNode}
  class="tooltip-wrapper"
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focusin={showTooltip}
  on:focusout={hideTooltip}
  on:click={hideTooltip}
>
  <slot />
</div>

{#if isVisible && text}
  <div
    use:portal
    class="tooltip {position}"
    style="top: {tooltipTop}px; left: {tooltipLeft}px;"
    transition:fade={{ duration: 150 }}
  >
    {text}
  </div>
{/if}

<style>
  .tooltip-wrapper {
    display: contents;
  }

  .tooltip {
    position: fixed;
    background: var(--text-colour);
    color: var(--secondary-background);
    padding: 6px 10px;
    border-radius: 4px;
    font-size: var(--font-small);
    font-family: var(--font-primary);
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .tooltip.top {
    transform: translate(-50%, calc(-100% - 8px));
  }

  .tooltip.bottom {
    transform: translate(-50%, 8px);
  }

  .tooltip.left {
    transform: translate(calc(-100% - 8px), -50%);
  }

  .tooltip.right {
    transform: translate(8px, -50%);
  }
</style>