<script lang="ts">
	import { onMount } from "svelte";

	let {
		isVisible = $bindable(true),
		loadingText = "",
		hangAtEnd = false,
		waitFor = null,
		disableTree = false,
		oncomplete,
	}: {
		isVisible?: boolean;
		loadingText?: string;
		hangAtEnd?: boolean;
		waitFor?: Promise<any> | null;
		disableTree?: boolean;
		oncomplete?: () => void;
	} = $props();

	let overlayContainer: HTMLDivElement | undefined = $state();
	let isAnimating = $state(false);
	let renderOverlay = $state(isVisible);
	let isFadingOut = $state(false);
	let leafTargetOpacity = $state(0.8);

	interface BranchData {
		id: number;
		d: string;
		strokeWidth: number;
		length: number;
		startTime: number;
	}

	interface LeafData {
		id: number;
		cx: number;
		cy: number;
		r: number;
		delay: number;
	}

	interface TreeConfig {
		leafUrl: string;
		barkUrl: string;
		isSakura: boolean;
		isAutumn: boolean;
		isWinter: boolean;
	}

	let activeConfig = $state<TreeConfig | null>(null);
	let branches = $state<BranchData[]>([]);
	let leaves = $state<LeafData[]>([]);

	const rawBarkFiles = import.meta.glob("/static/images/tree/bark/*.webp");
	const rawLeafFiles = import.meta.glob("/static/images/tree/leaves/*.webp");

	const barkUrls = Object.keys(rawBarkFiles).map((path) =>
		path.replace(/^\/static/, ""),
	);
	const leafUrls = Object.keys(rawLeafFiles).map((path) =>
		path.replace(/^\/static/, ""),
	);

	function isSakuraSeason(): boolean {
		const currentDate = new Date();
		const month = currentDate.getMonth() + 1;
		const day = currentDate.getDate();
		return (month === 3 && day >= 20) || (month === 4 && day <= 15);
	}

	function isAutumnSeason(): boolean {
		const currentDate = new Date();
		const month = currentDate.getMonth() + 1;
		const day = currentDate.getDate();
		return (
			(month === 9 && day >= 22) ||
			month === 10 ||
			month === 11 ||
			(month === 12 && day <= 20)
		);
	}

	function isWinterSeason(): boolean {
		const currentDate = new Date();
		const month = currentDate.getMonth() + 1;
		const day = currentDate.getDate();
		return (month === 12 && day >= 21) || month === 1 || month === 2 || (month === 3 && day <= 19);
	}

	function getTreeConfig(): TreeConfig {
		const isSakura = isSakuraSeason();
		const isAutumn = isAutumnSeason();
		const isWinter = isWinterSeason();

		const barks =
			barkUrls.length > 0
				? barkUrls
				: ["/images/tree/bark/pine-bark.webp"];
		const leavesList =
			leafUrls.length > 0
				? leafUrls
				: ["/images/tree/leaves/leaves.webp"];

		const sakuraBark =
			barks.find((url) => url.toLowerCase().includes("sakura")) ||
			barks[0];
		const regularBarks = barks.filter((url) => url !== sakuraBark);

		const sakuraLeaf =
			leavesList.find(
				(url) =>
					url.toLowerCase().includes("pink") ||
					url.toLowerCase().includes("sakura"),
			) || leavesList[0];

		const autumnLeaf =
			leavesList.find(
				(url) =>
					url.toLowerCase().includes("autum") ||
					url.toLowerCase().includes("autumn"),
			) || leavesList[0];

		const regularLeaves = leavesList.filter(
			(url) =>
				!url.toLowerCase().includes("pink") &&
				!url.toLowerCase().includes("sakura") &&
				!url.toLowerCase().includes("autum") &&
				!url.toLowerCase().includes("autumn"),
		);

		let leafUrl: string;
		if (isSakura) {
			leafUrl = sakuraLeaf;
		} else if (isAutumn) {
			leafUrl = autumnLeaf;
		} else {
			leafUrl =
				regularLeaves.length > 0
					? regularLeaves[
							Math.floor(Math.random() * regularLeaves.length)
						]
					: leavesList[0];
		}

		const barkUrl = isSakura
			? sakuraBark
			: regularBarks.length > 0
				? regularBarks[Math.floor(Math.random() * regularBarks.length)]
				: barks[0];

		return { leafUrl, barkUrl, isSakura, isAutumn, isWinter };
	}

	function generateTreeData(
		startX: number,
		startY: number,
		config: TreeConfig,
	) {
		const branchList: BranchData[] = [];
		const tempLeafList: Omit<LeafData, "delay">[] = [];
		let branchId = 0;
		let leafId = 0;

		function traverse(
			x: number,
			y: number,
			angle: number,
			depth: number,
			width: number,
			startTime: number,
		) {
			if (depth === 0) return;

			let finalAngle = angle;
			if (depth < 10) {
				finalAngle += Math.random() * 0.18 - 0.09;
			}

			const length = depth * 6;
			const endX = x + Math.sin(finalAngle) * length;
			const endY = y - Math.cos(finalAngle) * length;

			let pathD = "";
			let calcLength = 0;

			if (depth === 10) {
				pathD = `M ${x},${y} L ${endX},${endY}`;
				calcLength = Math.hypot(endX - x, endY - y);
			} else {
				const midX = (x + endX) / 2 + (Math.random() * 10 - 5);
				const midY = (y + endY) / 2 + (Math.random() * 10 - 5);
				pathD = `M ${x},${y} Q ${midX},${midY} ${endX},${endY}`;
				calcLength =
					Math.hypot(midX - x, midY - y) +
					Math.hypot(endX - midX, endY - midY);
			}

			branchList.push({
				id: branchId++,
				d: pathD,
				strokeWidth: width,
				length: Math.ceil(calcLength),
				startTime,
			});

			if (depth < 4 && !config.isWinter) {
				const leafChance = Math.max(0.55, (4 - depth) / 5.5);
				if (Math.random() <= leafChance) {
					const leafCount = Math.floor(Math.random() * 3) + 1;
					for (let i = 0; i < leafCount; i++) {
						const lAngle = Math.random() * Math.PI * 2;
						const distance = Math.floor(Math.random() * 9);
						const leafX = endX + Math.cos(lAngle) * distance;
						const leafY = endY + Math.sin(lAngle) * distance;
						const depthFactor = Math.random() * 0.6 + 0.4;
						const r = config.isSakura
							? 4 + depthFactor * 2
							: config.isAutumn
								? 5 + depthFactor * 2.5
								: 6 + depthFactor * 3;

						tempLeafList.push({
							id: leafId++,
							cx: leafX,
							cy: leafY,
							r,
						});
					}
				}
			}

			if (depth > 1) {
				const nextWidth = width * 0.7;
				const stepDuration = 0.15;
				traverse(
					endX,
					endY,
					finalAngle - 0.3,
					depth - 1,
					nextWidth,
					startTime + stepDuration,
				);
				traverse(
					endX,
					endY,
					finalAngle + 0.3,
					depth - 1,
					nextWidth,
					startTime + stepDuration + 0.01,
				);
			}
		}

		traverse(startX, startY, -Math.PI * 2, 10, 30, 0);
		return { branchList, tempLeafList };
	}

	async function startAnimation(): Promise<void> {
		if (isAnimating) return;
		isAnimating = true;

		try {
			if (!disableTree) {
				const width = 800;
				const height = 600;
				const startX = width / 2;
				const startY = height - 50;

				activeConfig = getTreeConfig();
				const data = generateTreeData(startX, startY, activeConfig);

				leafTargetOpacity = activeConfig.isSakura ? 0.9 : 0.8;
				branches = data.branchList;

				const svgFadeInDuration = 0.3;
				const maxBranchStartTime =
					branches.length > 0
						? Math.max(...branches.map((b) => b.startTime))
						: 0;

				const leavesStartTime =
					maxBranchStartTime + 0.15 + svgFadeInDuration;

				leaves = data.tempLeafList.map((leaf, index) => ({
					...leaf,
					delay: leavesStartTime + index * 0.001,
				}));

				const totalAnimationDuration =
					leavesStartTime + 0.4 + leaves.length * 0.001;

				await new Promise((resolve) =>
					setTimeout(resolve, totalAnimationDuration * 1000),
				);
			} else {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			if (waitFor) {
				try {
					await waitFor;
				} catch (e) {
					console.error("Tree spinner external task rejected:", e);
				}
			}

			if (!hangAtEnd) {
				await new Promise((resolve) => setTimeout(resolve, 300));

				isFadingOut = true;
				await new Promise((resolve) => setTimeout(resolve, 400));

				renderOverlay = false;
				isVisible = false;
				oncomplete?.();
			}
		} catch (error) {
			console.error("Tree animation error:", error);
			renderOverlay = false;
			isVisible = false;
			oncomplete?.();
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

{#if renderOverlay}
	<div
		bind:this={overlayContainer}
		class="tree-spinner-overlay"
		class:fade-out={isFadingOut}
	>
		{#if !disableTree}
			<div class="tree-canvas-wrapper">
				<svg class="tree-spinner-svg" viewBox="0 0 800 600">
					<defs>
						{#if activeConfig}
							<pattern
								id="active-leaf-pattern"
								patternUnits="userSpaceOnUse"
								width="100"
								height="100"
							>
								<image
									href={activeConfig.leafUrl}
									width="100"
									height="100"
								/>
							</pattern>

							<pattern
								id="active-bark-pattern"
								patternUnits="userSpaceOnUse"
								width="100"
								height="100"
							>
								<image
									href={activeConfig.barkUrl}
									width="100"
									height="100"
								/>
							</pattern>
						{/if}
					</defs>

					<g id="branches-group">
						{#each branches as branch (branch.id)}
							<path
								d={branch.d}
								stroke="url(#active-bark-pattern)"
								stroke-width={branch.strokeWidth}
								fill="none"
								stroke-linecap="round"
								class="branch"
								style="
                  stroke-dasharray: {branch.length};
                  stroke-dashoffset: {branch.length};
                  animation-delay: {branch.startTime + 0.3}s;
                "
							/>
						{/each}
					</g>

					<g
						id="leaves-group"
						style="--target-opacity: {leafTargetOpacity}"
					>
						{#each leaves as leaf (leaf.id)}
							<circle
								cx={leaf.cx}
								cy={leaf.cy}
								r={leaf.r}
								fill="url(#active-leaf-pattern)"
								class="leaf"
								style="animation-delay: {leaf.delay}s;"
							/>
						{/each}
					</g>
				</svg>
			</div>
		{:else}
			<div class="simple-spinner-wrapper">
				<div class="simple-spinner"></div>
			</div>
		{/if}

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
		transition: opacity 0.4s ease;
	}

	.tree-spinner-overlay.fade-out {
		opacity: 0;
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
		animation: fadeIn 0.3s forwards;
	}

	.branch {
		animation: drawBranch 0.15s linear forwards;
	}

	.leaf {
		opacity: 0;
		animation: fadeLeaf 0.4s forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}

	@keyframes drawBranch {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes fadeLeaf {
		to {
			opacity: var(--target-opacity, 0.8);
		}
	}

	.simple-spinner-wrapper {
		height: 55vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.simple-spinner {
		width: 64px;
		height: 64px;
		border: 5px solid var(--secondary-background, #2a2d35);
		border-top-color: var(--border-colour, #6a9b9b);
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
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
</style>