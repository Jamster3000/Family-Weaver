<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { Network, type Node, type Edge, type Options } from 'vis-network/standalone';
  import { networkStore } from '$networkStore';
  import { personTreeStore, type Person } from '$personTreeStore';

  let container = $state<HTMLDivElement | null>(null);
  let network: Network | null = null;

  onMount(() => {
    (async () => {
      try {
        const people = await invoke<Person[]>('get_all_people');
        personTreeStore.set(people);
      } catch (err) {
        console.error('Failed to fetch people:', err);
      }
    })();

    return () => {
      if (network) {
        network.destroy();
      }
    };
  });

  let nodes = $derived.by<Node[]>(() => {
    return $personTreeStore.map((person) => {
      const name = [person.firstName, person.lastName].filter(Boolean).join(' ') || 'Unknown';
      const birthInfo = person.dob ? `b. ${person.dob}` : '';
      return {
        id: person.id,
        label: name,
        title: birthInfo,
      };
    });
  });

  let edges = $derived.by<Edge[]>(() => {
    const edgeList: Edge[] = [];
    const drawnEdges = new Set<string>();

    $personTreeStore.forEach((person) => {
      if (person.childrenIds) {
        person.childrenIds.forEach((childId: string) => {
          const key = `parent-${person.id}-${childId}`;
          if (!drawnEdges.has(key)) {
            edgeList.push({ from: person.id, to: childId });
            drawnEdges.add(key);
          }
        });
      }

      if (person.partnerIds) {
        person.partnerIds.forEach((partnerId: string) => {
          const sorted = [person.id, partnerId].sort();
          const key = `partner-${sorted[0]}-${sorted[1]}`;
          if (!drawnEdges.has(key)) {
            edgeList.push({
              from: sorted[0],
              to: sorted[1],
              dashes: true,
              color: { color: '#aa8b56' },
            });
            drawnEdges.add(key);
          }
        });
      }
    });

    return edgeList;
  });

  $effect(() => {
    if (!container || !$personTreeStore.length) return;

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
        smooth: true,
      },
    };

    if (network) {
      network.destroy();
    }

    network = new Network(container, { nodes, edges }, options);
    networkStore.set(network);
  });
</script>

<div class="network-container" bind:this={container}></div>

<style>
  .network-container {
    width: 100%;
    height: calc(100vh - 35px);
    background: var(--primary-background);
  }

  :global(.vis-navigation) {
  display: none !important;
}

:global(.vis-button) {
  display: none !important;
}
</style>