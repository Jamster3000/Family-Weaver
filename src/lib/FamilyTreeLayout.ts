import * as d3 from 'd3';

export interface Person {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    parentIds?: string[] | null;
    childrenIds?: string[] | null;
    partnerIds?: string[] | null;
    dob?: string | Date | null;
    dod?: string | Date | null;
    [key: string]: unknown;
}

export interface Position {
    x: number;
    y: number;
}

export interface ThemeColors {
    primaryBg: string;
    secondaryBg: string;
    accent1: string;
    accent2: string;
    textPrimary: string;
    textSecondary: string;
    highlight: string;
    cardBorder: string;
}

export class FamilyTreeLayout {
    private container: HTMLElement;
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private g: d3.Selection<SVGGElement, unknown, null, undefined>;
    private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

    private LEVEL_HEIGHT = 200;
    private PARTNER_SPACING = 300;
    private NODE_WIDTH = 180;
    private NODE_HEIGHT = 100;

    private colors: ThemeColors = {
        primaryBg: '#1a1d24',
        secondaryBg: '#2a2d35',
        accent1: '#6b8e7d',
        accent2: '#6a9b9b',
        textPrimary: '#e2e4e8',
        textSecondary: '#b0b3b8',
        highlight: '#aa8b56',
        cardBorder: '#6b8e7d40'
    };

    constructor(
        container: HTMLElement,
        options?: {
            colors?: Partial<ThemeColors>;
        }
    ) {
        this.container = container;

        if (options?.colors) {
            this.colors = { ...this.colors, ...options.colors };
        }

        const computedStyle = getComputedStyle(document.documentElement);
        this.colors.primaryBg = computedStyle.getPropertyValue('--primary-bg').trim() || this.colors.primaryBg;
        this.colors.secondaryBg = computedStyle.getPropertyValue('--secondary-bg').trim() || this.colors.secondaryBg;
        this.colors.accent1 = computedStyle.getPropertyValue('--accent-1').trim() || this.colors.accent1;
        this.colors.accent2 = computedStyle.getPropertyValue('--accent-2').trim() || this.colors.accent2;
        this.colors.textPrimary = computedStyle.getPropertyValue('--text-primary').trim() || this.colors.textPrimary;
        this.colors.textSecondary = computedStyle.getPropertyValue('--text-secondary').trim() || this.colors.textSecondary;
        this.colors.highlight = computedStyle.getPropertyValue('--highlight').trim() || this.colors.highlight;
        this.colors.cardBorder = computedStyle.getPropertyValue('--card-border').trim() || this.colors.cardBorder;

        this.svg = d3
            .select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background-color', this.colors.primaryBg);

        this.zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);
        this.g = this.svg.append('g');
    }

    /**
     * Normalizes raw data so reciprocal parent/child/partner IDs exist on all nodes.
     */
    private normalizeMembers(members: Person[]): Person[] {
        const map = new Map<string, Person>();

        // Deep copy to avoid mutating the Svelte store
        members.forEach((m) => {
            map.set(m.id, {
                ...m,
                parentIds: [...(m.parentIds || [])],
                childrenIds: [...(m.childrenIds || [])],
                partnerIds: [...(m.partnerIds || [])]
            });
        });

        map.forEach((person) => {
            // Reciprocal Children -> Parents
            person.childrenIds?.forEach((childId) => {
                const child = map.get(childId);
                if (child) {
                    if (!child.parentIds?.includes(person.id)) {
                        child.parentIds.push(person.id);
                    }

                    // CRITICAL FIX: Auto-link co-parents to force horizontal spacing
                    child.parentIds.forEach((coParentId) => {
                        if (coParentId !== person.id) {
                            if (!person.partnerIds?.includes(coParentId)) {
                                person.partnerIds?.push(coParentId);
                            }
                            const coParent = map.get(coParentId);
                            if (coParent && !coParent.partnerIds?.includes(person.id)) {
                                coParent.partnerIds?.push(person.id);
                            }
                        }
                    });
                }
            });

            // Reciprocal Parents -> Children
            person.parentIds?.forEach((parentId) => {
                const parent = map.get(parentId);
                if (parent && !parent.childrenIds?.includes(person.id)) {
                    parent.childrenIds.push(person.id);
                }
            });

            // Reciprocal Partners
            person.partnerIds?.forEach((partnerId) => {
                const partner = map.get(partnerId);
                if (partner && !partner.partnerIds?.includes(person.id)) {
                    partner.partnerIds.push(person.id);
                }
            });
        });

        return Array.from(map.values());
    }

    public getLevels(members: Person[]): Map<string, number> {
        const levels = new Map<string, number>();
        const people = new Map<string, Person>(members.map((p) => [p.id, p]));

        function calcLevelFromChildren(id: string, visited = new Set<string>()): number {
            if (visited.has(id)) return 0;
            visited.add(id);
            const person = people.get(id);

            if (!person || !person.childrenIds || person.childrenIds.length === 0) {
                return 0;
            }

            const childLevels = person.childrenIds.map((cid) =>
                calcLevelFromChildren(cid, new Set(visited))
            );
            return Math.min(...childLevels) - 1;
        }

        members.forEach((p) => levels.set(p.id, calcLevelFromChildren(p.id)));

        const levelValues = Array.from(levels.values());
        const minLevel = levelValues.length > 0 ? Math.min(...levelValues) : 0;
        if (minLevel < 0) {
            levels.forEach((level, id) => levels.set(id, level - minLevel));
        }

        let changed = true;
        let iterations = 0;
        while (changed && iterations < 10) {
            changed = false;
            iterations++;

            members.forEach((person) => {
                if (!person.partnerIds) return;
                const myLevel = levels.get(person.id) ?? 0;

                person.partnerIds.forEach((pid) => {
                    const pLevel = levels.get(pid) ?? 0;
                    if (pLevel !== myLevel) {
                        const target = Math.max(myLevel, pLevel);
                        levels.set(person.id, target);
                        levels.set(pid, target);
                        changed = true;
                    }
                });
            });
        }

        return levels;
    }

    public getPositions(members: Person[]): { positions: Map<string, Position>; levels: Map<string, number> } {
        const levels = this.getLevels(members);
        const people = new Map<string, Person>(members.map((p) => [p.id, p]));
        const positions = new Map<string, Position>();

        const byLevel = new Map<number, Person[]>();
        members.forEach((p) => {
            const lv = levels.get(p.id) || 0;
            if (!byLevel.has(lv)) byLevel.set(lv, []);
            byLevel.get(lv)!.push(p);
        });

        const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => b - a);

        sortedLevels.forEach((level) => {
            const peopleAtLevel = byLevel.get(level) || [];
            const positioned = new Set<string>();

            peopleAtLevel.forEach((person) => {
                if (positioned.has(person.id)) return;

                const partners = (person.partnerIds || [])
                    .map((pid) => people.get(pid))
                    .filter((p): p is Person => Boolean(p) && levels.get(p!.id) === level && !positioned.has(p!.id));

                let x: number;

                if (partners.length > 0) {
                    const allInGroup = [person, ...partners];
                    const allChildren = new Set<string>();

                    allInGroup.forEach((p) => {
                        (p.childrenIds || []).forEach((cid) => allChildren.add(cid));
                    });

                    if (allChildren.size > 0) {
                        const childXs = Array.from(allChildren)
                            .map((cid) => positions.get(cid)?.x)
                            .filter((x): x is number => x !== undefined);

                        if (childXs.length > 0) {
                            const centerX = childXs.reduce((a, b) => a + b, 0) / childXs.length;
                            x = centerX - this.PARTNER_SPACING / 2;
                        } else {
                            x = 0;
                        }
                    } else {
                        x = 0;
                    }

                    positions.set(person.id, { x, y: level * this.LEVEL_HEIGHT });
                    positions.set(partners[0].id, { x: x + this.PARTNER_SPACING, y: level * this.LEVEL_HEIGHT });
                    positioned.add(person.id);
                    positioned.add(partners[0].id);
                } else {
                    if (person.childrenIds && person.childrenIds.length > 0) {
                        const childXs = person.childrenIds
                            .map((cid) => positions.get(cid)?.x)
                            .filter((x): x is number => x !== undefined);

                        if (childXs.length > 0) {
                            x = childXs.reduce((a, b) => a + b, 0) / childXs.length;
                        } else {
                            x = 0;
                        }
                    } else {
                        x = 0;
                    }

                    positions.set(person.id, { x, y: level * this.LEVEL_HEIGHT });
                    positioned.add(person.id);
                }
            });
        });

        if (positions.size > 0) {
            const xs = Array.from(positions.values()).map((p) => p.x);
            const offset = -(Math.min(...xs) + Math.max(...xs)) / 2;
            positions.forEach((pos) => (pos.x += offset));
        }

        return { positions, levels };
    }

    private drawLines(members: Person[], positions: Map<string, Position>): void {
        this.g.selectAll('.line').remove();
        const linesGroup = this.g.append('g').attr('class', 'line');

        members.forEach((person) => {
            if (!person.parentIds || person.parentIds.length === 0) return;

            const childPos = positions.get(person.id);
            if (!childPos) return;

            if (person.parentIds.length === 1) {
                const parentPos = positions.get(person.parentIds[0]);
                if (!parentPos) return;

                const midY = (parentPos.y + childPos.y) / 2;
                linesGroup
                    .append('path')
                    .attr(
                        'd',
                        `M ${parentPos.x} ${parentPos.y + this.NODE_HEIGHT / 2} L ${parentPos.x} ${midY} L ${childPos.x} ${midY} L ${childPos.x} ${childPos.y - this.NODE_HEIGHT / 2}`
                    )
                    .attr('stroke', this.colors.accent1)
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            } else {
                const parentPoses = person.parentIds
                    .map((pid) => positions.get(pid))
                    .filter((p): p is Position => Boolean(p));

                if (parentPoses.length < 2) return;

                const xs = parentPoses.map((p) => p.x).sort((a, b) => a - b);
                const parentY = parentPoses[0].y;
                const junctionY = parentY + (childPos.y - parentY) / 2;

                linesGroup
                    .append('line')
                    .attr('x1', xs[0])
                    .attr('y1', junctionY)
                    .attr('x2', xs[xs.length - 1])
                    .attr('y2', junctionY)
                    .attr('stroke', this.colors.accent1)
                    .attr('stroke-width', 2);

                parentPoses.forEach((pp) => {
                    linesGroup
                        .append('line')
                        .attr('x1', pp.x)
                        .attr('y1', pp.y + this.NODE_HEIGHT / 2)
                        .attr('x2', pp.x)
                        .attr('y2', junctionY)
                        .attr('stroke', this.colors.accent1)
                        .attr('stroke-width', 2);
                });

                linesGroup
                    .append('line')
                    .attr('x1', childPos.x)
                    .attr('y1', junctionY)
                    .attr('x2', childPos.x)
                    .attr('y2', childPos.y - this.NODE_HEIGHT / 2)
                    .attr('stroke', this.colors.accent1)
                    .attr('stroke-width', 2);
            }
        });

        const drawnPartnerships = new Set<string>();
        members.forEach((person) => {
            if (!person.partnerIds) return;
            person.partnerIds.forEach((pid) => {
                const key = [person.id, pid].sort().join('-');
                if (drawnPartnerships.has(key)) return;
                drawnPartnerships.add(key);

                const p1 = positions.get(person.id);
                const p2 = positions.get(pid);
                if (!p1 || !p2) return;

                linesGroup
                    .append('line')
                    .attr('x1', p1.x)
                    .attr('y1', p1.y)
                    .attr('x2', p2.x)
                    .attr('y2', p2.y)
                    .attr('stroke', this.colors.highlight)
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '6,4');
            });
        });
    }

    private drawNodes(members: Person[], positions: Map<string, Position>): void {
        this.g.selectAll('.node').remove();
        const nodesGroup = this.g.append('g').attr('class', 'node');

        const groups = nodesGroup
            .selectAll<SVGGElement, Person>('g')
            .data(members)
            .enter()
            .append('g')
            .attr('transform', (d) => {
                const pos = positions.get(d.id) || { x: 0, y: 0 };
                return `translate(${pos.x}, ${pos.y})`;
            });

        groups
            .append('rect')
            .attr('x', -this.NODE_WIDTH / 2)
            .attr('y', -this.NODE_HEIGHT / 2)
            .attr('width', this.NODE_WIDTH)
            .attr('height', this.NODE_HEIGHT)
            .attr('rx', 8)
            .attr('fill', this.colors.secondaryBg)
            .attr('stroke', this.colors.accent1)
            .attr('stroke-width', 2);

        groups
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 5)
            .attr('fill', this.colors.textPrimary)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text((d) => `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unknown');
    }

    public render(rawMembers: Person[], themeColors?: ThemeColors): void {
        if (themeColors) {
            this.colors = themeColors;
        }

        if (!rawMembers || rawMembers.length === 0) {
            this.g.selectAll('*').remove();
            return;
        }

        const members = this.normalizeMembers(rawMembers);
        const { positions } = this.getPositions(members);

        this.drawLines(members, positions);
        this.drawNodes(members, positions);

        requestAnimationFrame(() => {
            this.fit();
        });
    }

    public fit(): void {
        try {
            const node = this.g.node();
            if (!node) return;

            const bbox = node.getBBox();
            const parent = this.container;
            const w = parent.clientWidth;
            const h = parent.clientHeight;

            if (bbox.width === 0 || bbox.height === 0) return;

            const scale = Math.min(0.85 / Math.max(bbox.width / w, bbox.height / h), 1.5);
            const tx = w / 2 - scale * (bbox.x + bbox.width / 2);
            const ty = h / 2 - scale * (bbox.y + bbox.height / 2);

            this.svg
                .transition()
                .duration(750)
                .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        } catch (error) {
            console.error('Fit error:', error);
        }
    }

    public destroy(): void {
        this.svg.remove();
    }
}