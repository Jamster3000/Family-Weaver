<script lang="ts">
  import { onMount, tick } from 'svelte';
  import gsap from 'gsap';

  export let isVisible = true;
  export let loadingText = '';
  export let hangAtEnd = false;
  export let waitFor: Promise<any> | null = null;

  let svgContainer: SVGSVGElement;
  let overlayContainer: HTMLDivElement;
  let isAnimating = false;

  interface BranchData {
    id: number;
    d: string;
    strokeWidth: number;
    barkTextureId: string;
    length: number;
    startTime: number;
  }

  interface LeafData {
    id: number;
    cx: number;
    cy: number;
    r: number;
    leafPatternId: string;
  }

  interface TreeConfig {
    leafPatternId: string;
    barkTextureId: string;
    isSakura: boolean;
  }

  let branches: BranchData[] = [];
  let leaves: LeafData[] = [];

  const BARK_TEXTURE_IDS = [
    'barkTexture1', 'barkTexture2', 'barkTexture3', 'barkTexture4',
    'barkTexture5', 'barkTexture6', 'barkTexture7', 'barkTexture8',
    'barkTexture9', 'barkTexture10', 'barkTexture11',
  ];

  const BARK_TEXTURE_FILES: Record<string, string> = {
    barkTexture1: 'bark-bluegum.png',
    barkTexture2: 'bark-brown-2.png',
    barkTexture3: 'bark-brown.png',
    barkTexture4: 'bark-platanus.png',
    barkTexture5: 'chinese-cedar-bark.png',
    barkTexture6: 'japanese-hackberry.png',
    barkTexture7: 'knotted-pine-bark.png',
    barkTexture8: 'palm-bark.png',
    barkTexture9: 'pine-bark.png',
    barkTexture10: 'sakura-bark.png',
    barkTexture11: 'willow-bark.png',
  };

  const LEAF_PATTERN_FILES: Record<string, string> = {
    leafPattern: 'leaves.png',
    leafPattern2: 'leaves-2.png',
    sakuraLeafPattern: 'pink-leaves.png',
  };

  function isSakuraSeason(): boolean {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    return (month === 3 && day >= 20) || (month === 4 && day <= 15);
  }

  function getTreeConfig(): TreeConfig {
    const isSakura = isSakuraSeason();
    const leafPatternId = isSakura
      ? 'sakuraLeafPattern'
      : Math.random() < 0.5
        ? 'leafPattern'
        : 'leafPattern2';

    const barkTextureId = isSakura
      ? 'barkTexture10'
      : BARK_TEXTURE_IDS[Math.floor(Math.random() * BARK_TEXTURE_IDS.length)];

    return { leafPatternId, barkTextureId, isSakura };
  }

  // Pre-calculate tree geometry in pure JS memory without touching the DOM
  function generateTreeData(startX: number, startY: number, config: TreeConfig) {
    const branchList: BranchData[] = [];
    const leafList: LeafData[] = [];
    let branchId = 0;
    let leafId = 0;

    function traverse(
      x: number,
      y: number,
      angle: number,
      depth: number,
      width: number,
      startTime: number
    ) {
      if (depth === 0) return;

      let finalAngle = angle;
      if (depth < 10) {
        finalAngle += Math.random() * 0.18 - 0.09;
      }

      const length = depth * 6;
      const endX = x + Math.sin(finalAngle) * length;
      const endY = y - Math.cos(finalAngle) * length;

      let pathD = '';
      let calcLength = 0;

      if (depth === 10) {
        pathD = `M ${x},${y} L ${endX},${endY}`;
        calcLength = Math.hypot(endX - x, endY - y);
      } else {
        const midX = (x + endX) / 2 + (Math.random() * 10 - 5);
        const midY = (y + endY) / 2 + (Math.random() * 10 - 5);
        pathD = `M ${x},${y} Q ${midX},${midY} ${endX},${endY}`;
        calcLength = Math.hypot(midX - x, midY - y) + Math.hypot(endX - midX, endY - midY);
      }

      branchList.push({
        id: branchId++,
        d: pathD,
        strokeWidth: width,
        barkTextureId: config.barkTextureId,
        length: Math.ceil(calcLength),
        startTime,
      });

      if (depth < 4) {
        const leafChance = Math.max(0.55, (4 - depth) / 5.5);
        if (Math.random() <= leafChance) {
          const leafCount = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < leafCount; i++) {
            const lAngle = Math.random() * Math.PI * 2;
            const distance = Math.floor(Math.random() * 9);
            const leafX = endX + Math.cos(lAngle) * distance;
            const leafY = endY + Math.sin(lAngle) * distance;
            const depthFactor = Math.random() * 0.6 + 0.4;
            const r = config.isSakura ? 4 + depthFactor * 2 : 6 + depthFactor * 3;

            leafList.push({
              id: leafId++,
              cx: leafX,
              cy: leafY,
              r,
              leafPatternId: config.leafPatternId,
            });
          }
        }
      }

      if (depth > 1) {
        const nextWidth = width * 0.7;
        const stepDuration = 0.15;
        traverse(endX, endY, finalAngle - 0.3, depth - 1, nextWidth, startTime + stepDuration);
        traverse(endX, endY, finalAngle + 0.3, depth - 1, nextWidth, startTime + stepDuration + 0.01);
      }
    }

    traverse(startX, startY, -Math.PI * 2, 10, 30, 0);
    return { branchList, leafList };
  }

  async function startAnimation(): Promise<void> {
    if (!svgContainer || isAnimating) return;
    isAnimating = true;

    try {
      const width = svgContainer.clientWidth || 800;
      const height = svgContainer.clientHeight || 600;
      const startX = width / 2;
      const startY = height - 50;

      svgContainer.setAttribute('viewBox', `0 0 ${width} ${height}`);

      const config = getTreeConfig();
      const data = generateTreeData(startX, startY, config);

      branches = data.branchList;
      leaves = data.leafList;

      // Wait for Svelte to declaratively render elements to the DOM
      await tick();

      const branchElements = svgContainer.querySelectorAll<SVGPathElement>('.branch');
      const leafElements = svgContainer.querySelectorAll<SVGCircleElement>('.leaf');

      // Unified GSAP timeline replacing microtask loops & synchronous layout thrashing
      const tl = gsap.timeline();

      tl.to(svgContainer, { opacity: 1, duration: 0.3 });

      branches.forEach((branchData, index) => {
        const el = branchElements[index];
        if (el) {
          tl.to(
            el,
            { strokeDashoffset: 0, duration: 0.15, ease: 'none' },
            branchData.startTime + 0.3
          );
        }
      });

      if (leafElements.length > 0) {
        const leavesStartTime = tl.duration();
        tl.to(
          leafElements,
          {
            opacity: config.isSakura ? 0.9 : 0.8,
            duration: 0.4,
            stagger: 0.001,
          },
          leavesStartTime
        );
      }

      await tl;

      if (waitFor) {
        try {
          await waitFor;
        } catch (e) {
          console.error('Tree spinner external task rejected:', e);
        }
      }

      if (!hangAtEnd) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await gsap.to(overlayContainer, { opacity: 0, duration: 0.5 });
        isVisible = false;
      }
    } catch (error) {
      console.error('Tree animation error:', error);
      isVisible = false;
    } finally {
      isAnimating = false;
    }
  }

  onMount(() => {
    if (isVisible) {
      startAnimation();
    }
  });
</script>

{#if isVisible}
  <div bind:this={overlayContainer} class="tree-spinner-overlay">
    <div class="tree-canvas-wrapper">
      <svg bind:this={svgContainer} class="tree-spinner-svg" viewBox="0 0 800 600">
        <defs>
          <pattern id="leafPattern" patternUnits="userSpaceOnUse" width="100" height="100">
            <image href="/images/tree/{LEAF_PATTERN_FILES.leafPattern}" width="100" height="100" />
          </pattern>
          <pattern id="leafPattern2" patternUnits="userSpaceOnUse" width="100" height="100">
            <image href="/images/tree/{LEAF_PATTERN_FILES.leafPattern2}" width="100" height="100" />
          </pattern>
          <pattern id="sakuraLeafPattern" patternUnits="userSpaceOnUse" width="100" height="100">
            <image href="/images/tree/{LEAF_PATTERN_FILES.sakuraLeafPattern}" width="100" height="100" />
          </pattern>

          {#each BARK_TEXTURE_IDS as barkId (barkId)}
            <pattern id={barkId} patternUnits="userSpaceOnUse" width="100" height="100">
              <image href="/images/tree/{BARK_TEXTURE_FILES[barkId]}" width="100" height="100" />
            </pattern>
          {/each}
        </defs>

        <g id="branches-group">
          {#each branches as branch (branch.id)}
            <path
              d={branch.d}
              stroke="url(#{branch.barkTextureId})"
              stroke-width={branch.strokeWidth}
              fill="none"
              stroke-linecap="round"
              class="branch"
              style="stroke-dasharray: {branch.length}; stroke-dashoffset: {branch.length};"
            />
          {/each}
        </g>

        <g id="leaves-group">
          {#each leaves as leaf (leaf.id)}
            <circle
              cx={leaf.cx}
              cy={leaf.cy}
              r={leaf.r}
              fill="url(#{leaf.leafPatternId})"
              class="leaf"
            />
          {/each}
        </g>
      </svg>
    </div>

    {#if loadingText}
      <div class="loading-badge">
        <span class="loading-text">{loadingText}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tree-spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--primary-background, #1a1d24);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 1;
    padding: 20px;
    box-sizing: border-box;
  }

  .tree-canvas-wrapper {
    width: 100%;
    max-width: 700px;
    height: 55vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tree-spinner-svg {
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .loading-badge {
    margin-top: 1.5rem;
    background-color: var(--secondary-background, #2a2d35);
    border: 2px solid var(--border-colour, #6a9b9b);
    padding: 14px 32px;
    border-radius: 30px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    max-width: 80%;
  }

  .loading-text {
    color: var(--text-colour, #e2e4e8);
    font-family: var(--font-primary);
    font-size: var(--font-large, 1.375rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    text-align: center;
    line-height: 1.4;
  }

  .leaf {
    opacity: 0;
  }
</style>