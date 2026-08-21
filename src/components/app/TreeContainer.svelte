<script lang="ts">
  import { onMount } from 'svelte';
  import { Network, type Node, type Edge, type Options } from 'vis-network/standalone';
  import { networkStore } from '$networkStore';

  let container: HTMLDivElement;
  let network: Network;

  onMount(() => {
    const nodes: Node[] = [
      { id: 1, label: 'John Doe', title: 'b. 1945' },
      { id: 2, label: 'Jane Doe', title: 'b. 1947' },
      { id: 3, label: 'Robert Doe', title: 'b. 1970' },
      { id: 4, label: 'Sarah Doe', title: 'b. 1972' },
      { id: 5, label: 'Michael Smith', title: 'b. 1968' },
    ];

    const edges: Edge[] = [
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
    ];

    const options: Options = {
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
        },
      },
      physics: false,
      nodes: {
        shape: 'box',
        margin: 10,
        widthConstraint: {
          maximum: 200,
        },
        font: {
          size: 14,
          face: 'Lora, sans-serif',
          color: '#e2e4e8',
        },
        color: {
          background: '#6b8e7d',
          border: '#6a9b9b',
          highlight: {
            background: '#6a9b9b',
            border: '#aa8b56',
          },
        },
      },
      edges: {
        color: {
          color: '#6b8e7d',
          highlight: '#aa8b56',
        },
        width: 2,
        smooth: {
          type: 'curvedCW',
        },
      },
    };

    network = new Network(container, { nodes, edges }, options);

    networkStore.set(network);

    return () => {
      if (network) {
        network.destroy();
      }
    };
  });
</script>

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div bind:this={container} class="network-container" />

<style>
  .network-container {
    width: 100%;
    height: calc(100vh - 35px);
    border: 1px solid var(--secondary-colour);
    border-radius: 6px;
    background: var(--primary-background);
  }

  :global(.vis-navigation) {
  display: none !important;
}

:global(.vis-button) {
  display: none !important;
}
</style>