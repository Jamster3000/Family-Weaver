import * as d3 from 'd3';
import type { Person, ThemeColors, LayoutConfig, LayoutOptions } from './models';
import { DEFAULT_LAYOUT_CONFIG, DEFAULT_THEME_COLORS } from './models';
import { normalizeMembers } from './normalize';
import { calculatePositions } from './layoutEngine';
import { drawLines, drawNodes } from './d3Renderers';

export class FamilyTreeLayout {
    private container: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private g: d3.Selection<SVGGElement, unknown, null, undefined>;
    private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

    private config: LayoutConfig = DEFAULT_LAYOUT_CONFIG;
    private colors: ThemeColors = DEFAULT_THEME_COLORS;
    private toolbarSelector?: string;

    constructor(
        container: HTMLElement,
        options?: LayoutOptions
    ) {
        this.container = container;

        if (options?.config) {
            this.config = { ...this.config, ...options.config };
        }

        if (options?.colors) {
            this.colors = { ...this.colors, ...options.colors };
        }

        if (options?.toolbarSelector) {
            this.toolbarSelector = options.toolbarSelector;
        }

        // Creates a responsive SVG element which fills the entire container
        this.svg = d3
            .select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%');

        // Initializes D3 zoom behavior
        this.zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4.5]) // Set the minimum and maximum zoom levels allowed
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);
        this.g = this.svg.append('g');
    }

    public render(rawMembers: Person[], themeColors?: Partial<ThemeColors>): void {
        if (!rawMembers || rawMembers.length === 0) {
            this.g.selectAll('*').remove();
            return;
        }

        const members = normalizeMembers(rawMembers);
        const { positions, seatedPairs } = calculatePositions(members, this.config);

        //draw lines first so they appear behind the nodes
        drawLines(this.g, members, positions, this.colors, this.config, seatedPairs);
        drawNodes(this.g, members, positions, this.colors, this.config);

        // request animation frame for better performance and to ensure the DOM is updated before fitting
        requestAnimationFrame(() => {
            this.fit();
        });
    }

    public fit(overrideSelector?: string): void {
        //calculates the optimal scale and position to center and fit the entire family tree inside the visible container
        try {
            // Get the node and its bounding box
            const node = this.g.node();
            if (!node) return;

            const bbox = node.getBBox();
            const parent = this.container;
            const w = parent.clientWidth; //width
            let h = parent.clientHeight; //height

            const selector = overrideSelector || this.toolbarSelector;
            //scaling the tree to fit within the container with padding/margin
            //also requires taking into account the toolbar positioning too
            //so that the tree doesn't get partially covered up with the toolbar.
            let toolbarOffset = 0;
            if (selector) {
                const toolbarEl = document.querySelector(selector);
                if (toolbarEl) {
                    toolbarOffset = toolbarEl.getBoundingClientRect().height;
                    h = Math.max(0, h - toolbarOffset);
                }
            }

            if (bbox.width === 0 || bbox.height === 0) return;

            //bbox.w / w & bbox.h / h compute how much larger or smaller the tree is compared to the container it's rendered in.
            // 0.85 is the scaling factor meaning there is a 15% margin/padding around the tree.
            // 1.5 is the zoom level of 150%.
            const scale = Math.min(0.85 / Math.max(bbox.width / w, bbox.height / h), 1.5);
            const tx = w / 2 - scale * (bbox.x + bbox.width / 2);
            const ty = h / 2 - scale * (bbox.y + bbox.height / 2);

            //Get the transition duration from CSS variable instead of hardcoding it
            // This has to be converted into milliseconds for d3's duration
            const rawDuration = getComputedStyle(document.documentElement)
                .getPropertyValue("--long-transition-duration")
                .trim();

            const durationMs = rawDuration.endsWith('s') && !rawDuration.endsWith('ms')
                ? parseFloat(rawDuration) * 1000
                : parseFloat(rawDuration) || 750;

            this.svg
                .transition()
                .duration(durationMs)
                .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        } catch (error) {
            console.error('Fit error:', error);
        }
    }

    public destroy(): void {
        this.svg.remove();
    }
}