<script lang="ts">
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  export let isVisible = true;
  export let loadingText = '';
  export let hangAtEnd = false;
  export let waitFor: Promise<any> | null = null;

  let svgContainer: SVGSVGElement;
  let overlayContainer: HTMLDivElement;
  let isAnimating = false;
  let leafBatchQueue: SVGCircleElement[] = [];

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

  interface TreeConfig {
    leafPatternId: string;
    barkTextureId: string;
    isSakura: boolean;
  }

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

  function createBranch(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    barkTextureId: string,
    isTrunk = false
  ): SVGPathElement {
    const branch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const path = isTrunk
      ? `M ${x1},${y1} L ${x2},${y2}`
      : `M ${x1},${y1} Q ${(x1 + x2) / 2 + Math.random() * 10 - 5},${(y1 + y2) / 2 + Math.random() * 10 - 5} ${x2},${y2}`;

    branch.setAttribute('d', path);
    branch.setAttribute('stroke', `url(#${barkTextureId})`);
    branch.setAttribute('stroke-width', width.toString());
    branch.setAttribute('fill', 'none');
    branch.setAttribute('stroke-linecap', 'round');
    branch.classList.add('branch');

    const pathLength = branch.getTotalLength();
    branch.style.strokeDasharray = pathLength.toString();
    branch.style.strokeDashoffset = pathLength.toString();

    return branch;
  }

  function addLeaves(
    x: number,
    y: number,
    leafPatternId: string,
    isSakura: boolean,
    depth: number
  ): SVGCircleElement[] {
    const leafChance = Math.max(0.55, (4 - depth) / 5.5);
    if (Math.random() > leafChance) return [];

    const leafCount = Math.floor(Math.random() * 3) + 1;
    const leaves: SVGCircleElement[] = [];

    for (let i = 0; i < leafCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.floor(Math.random() * 9);
      const leafX = x + Math.cos(angle) * distance;
      const leafY = y + Math.sin(angle) * distance;
      const depthFactor = Math.random() * 0.6 + 0.4;

      const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      leaf.setAttribute('cx', leafX.toString());
      leaf.setAttribute('cy', leafY.toString());
      leaf.setAttribute('r', (isSakura ? 4 + depthFactor * 2 : 6 + depthFactor * 3).toString());
      leaf.setAttribute('fill', `url(#${leafPatternId})`);
      leaf.classList.add('leaf');
      leaf.style.opacity = '0';

      leaves.push(leaf);
      leafBatchQueue.push(leaf);
    }

    return leaves;
  }

  function flushLeafBatch(leavesGroup: SVGGElement): SVGCircleElement[] {
    const fragment = document.createDocumentFragment();
    leafBatchQueue.forEach((leaf) => fragment.appendChild(leaf));
    leavesGroup.appendChild(fragment);

    const leavesToAnimate = [...leafBatchQueue];
    leafBatchQueue = [];

    return leavesToAnimate;
  }

  async function drawBranch(
    x: number,
    y: number,
    angle: number,
    depth: number,
    width: number,
    config: TreeConfig,
    branchesGroup: SVGGElement,
    leavesGroup: SVGGElement,
    delay = 0
  ): Promise<void> {
    if (depth === 0) return;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    let finalAngle = angle;
    if (depth < 10) {
      finalAngle += Math.random() * 0.18 - 0.09;
    }

    const length = depth * 6;
    const endX = x + Math.sin(finalAngle) * length;
    const endY = y - Math.cos(finalAngle) * length;

    const branch = createBranch(x, y, endX, endY, width, config.barkTextureId, depth === 10);
    branchesGroup.appendChild(branch);

    await gsap.to(branch, {
      strokeDashoffset: 0,
      duration: 0.15,
      ease: 'none',
    });

    if (depth < 4) {
      addLeaves(endX, endY, config.leafPatternId, config.isSakura, depth);
    }

    if (depth > 1) {
      const nextWidth = width * 0.7;

      const leftPromise = drawBranch(
        endX, endY, finalAngle - 0.3, depth - 1, nextWidth,
        config, branchesGroup, leavesGroup, 0
      );

      const rightPromise = (async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return drawBranch(
          endX, endY, finalAngle + 0.3, depth - 1, nextWidth,
          config, branchesGroup, leavesGroup, 0
        );
      })();

      await Promise.all([leftPromise, rightPromise]);
    }
  }

  async function startAnimation(): Promise<void> {
    if (!svgContainer || isAnimating) return;

    isAnimating = true;
    leafBatchQueue = [];

    try {
      await new Promise<void>((resolve) => {
        if (svgContainer.clientWidth > 0 && svgContainer.clientHeight > 0) {
          resolve();
        } else {
          const checkInterval = setInterval(() => {
            if (svgContainer.clientWidth > 0 && svgContainer.clientHeight > 0) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50);
        }
      });

      const width = svgContainer.clientWidth;
      const height = svgContainer.clientHeight;
      const startX = width / 2;
      const startY = height - 50;

      svgContainer.setAttribute('viewBox', `0 0 ${width} ${height}`);

      let branchesGroup = svgContainer.querySelector('#branches-group') as SVGGElement;
      let leavesGroup = svgContainer.querySelector('#leaves-group') as SVGGElement;

      if (!branchesGroup) {
        branchesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        branchesGroup.id = 'branches-group';
        svgContainer.appendChild(branchesGroup);
      }

      if (!leavesGroup) {
        leavesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        leavesGroup.id = 'leaves-group';
        svgContainer.appendChild(leavesGroup);
      }

      branchesGroup.innerHTML = '';
      leavesGroup.innerHTML = '';

      const config = getTreeConfig();

      await gsap.to(svgContainer, { opacity: 1, duration: 0.3 });

      await drawBranch(startX, startY, -Math.PI * 2, 10, 30, config, branchesGroup, leavesGroup);

      const allLeaves = flushLeafBatch(leavesGroup);
      let leafAnimationPromise = Promise.resolve();

      if (allLeaves.length > 0) {
        leafAnimationPromise = new Promise((resolve) => {
          gsap.to(allLeaves, {
            opacity: config.isSakura ? 0.9 : 0.8,
            duration: 0.4,
            stagger: 0.001,
            onComplete: resolve,
          });
        });
      }

      await leafAnimationPromise;

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

        <g id="branches-group"></g>
        <g id="leaves-group"></g>
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
    font-family: var(--font-primary, 'Lora', serif);
    font-size: var(--font-large, 1.375rem);
    font-weight: 600;
    letter-spacing: 0.02em;
    text-align: center;
    line-height: 1.4;
  }

  :global(.branch) {
    stroke-dasharray: 0;
    stroke-dashoffset: 0;
  }

  :global(.leaf) {
    opacity: 0;
  }
</style>