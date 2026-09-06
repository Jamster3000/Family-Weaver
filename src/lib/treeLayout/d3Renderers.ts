import type * as d3 from 'd3';
import type { Person, Position, ThemeColors, LayoutConfig } from './models';

type D3Group = d3.Selection<SVGGElement, unknown, null, undefined>;

export function drawLines(
    g: D3Group,
    members: Person[],
    positions: Map<string, Position>,
    colors: ThemeColors,
    config: LayoutConfig,
    seatedPairs: Set<string>
): void {
    // Draw lines connecting nodes (parent/child/partner)
    g.selectAll('.line').remove();
    const linesGroup = g.append('g').attr('class', 'line');

    // Group children by their parent set to handle multi-parent cases correctly
    const childrenByParents = new Map<string, Person[]>();
    members.forEach((person) => {
        //If the person doesn't have parent then skip line drawing.
        // Can't have a child without a parent, so this is safe.
        if (!person.parentIds || person.parentIds.length === 0) return;

        const key = [...person.parentIds].sort().join(',');
        if (!childrenByParents.has(key)) childrenByParents.set(key, []);
        childrenByParents.get(key)!.push(person);
    });

    childrenByParents.forEach((children, key) => {
        const parentIds = key.split(',');
        const parentPoses = parentIds
            .map((pid) => positions.get(pid))
            .filter((p): p is Position => Boolean(p));
        const childPoses = children
            .map((c) => positions.get(c.id))
            .filter((p): p is Position => Boolean(p));

        if (parentPoses.length === 0 || childPoses.length === 0) return;

        const parentY = parentPoses[0].y;
        const childY = childPoses[0].y;
        // The exact vertical halfway point between parents generation row
        // and child's generation row. This acts as the horizontal "bridge" between child and parents
        const junctionY = parentY + (childY - parentY) / 2;

        // if the person has only one parent
        if (parentPoses.length === 1 && childPoses.length === 1) {
            const parentPos = parentPoses[0];
            const childPos = childPoses[0];

            // Create a straight line from bottom of parent node to the top of child node
            linesGroup
                .append('path')
                .attr(
                    'd',
                    `M ${parentPos.x} ${parentPos.y + config.NODE_HEIGHT / 2} L ${parentPos.x} ${junctionY} L ${childPos.x} ${junctionY} L ${childPos.x} ${childPos.y - config.NODE_HEIGHT / 2}`
                )
                .attr('stroke', colors.accent1)
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            return;
        }

        // Getting to this point means there are multiple parents or multiple children with same parents
        // Bridge spans the full range of BOTH parents and children to handle cases where
        // children may be positioned outside the parent range (e.g., partnered units)
        const allXs = [...parentPoses.map((p) => p.x), ...childPoses.map((p) => p.x)];
        const minX = Math.min(...allXs);
        const maxX = Math.max(...allXs);

        // Draws horizontal line running from leftmost to rightmost point at the junctionY level
        linesGroup
            .append('line')
            .attr('x1', minX)
            .attr('y1', junctionY)
            .attr('x2', maxX)
            .attr('y2', junctionY)
            .attr('stroke', colors.accent1)
            .attr('stroke-width', 2);

        //Loops through each parent to draw a vertical line from
        //the center bottom of each parent node to the junctionY line
        parentPoses.forEach((pp) => {
            linesGroup
                .append('line')
                .attr('x1', pp.x)
                .attr('y1', pp.y + config.NODE_HEIGHT / 2)
                .attr('x2', pp.x)
                .attr('y2', junctionY)
                .attr('stroke', colors.accent1)
                .attr('stroke-width', 2);
        });

        //Draw a vertical line from each child node to the junctionY line
        childPoses.forEach((cp) => {
            linesGroup
                .append('line')
                .attr('x1', cp.x)
                .attr('y1', junctionY)
                .attr('x2', cp.x)
                .attr('y2', cp.y - config.NODE_HEIGHT / 2)
                .attr('stroke', colors.accent1)
                .attr('stroke-width', 2);
        });
    });

    const drawnPartnerships = new Set<string>();
    members.forEach((person) => {
        //Loops through each person for partners
        if (!person.partnerIds) return;

        person.partnerIds.forEach((pid) => {
            const key = [person.id, pid].sort().join('-');
            if (drawnPartnerships.has(key)) return;

            // Only draw a couple-line for pairs actually seated next to each other.
            // A person can have multiple co-parents (blended families, shared kids
            // with no relationship, etc.) but only one can be a real spatial partner -
            // the rest are co-parent links only, already shown via the child bridge.
            if (!seatedPairs.has(key)) return;

            drawnPartnerships.add(key);

            // Get partner positions
            const p1 = positions.get(person.id);
            const p2 = positions.get(pid);
            if (!p1 || !p2) return;

            // Draw a dashed line between partners
            linesGroup
                .append('line')
                .attr('x1', p1.x)
                .attr('y1', p1.y)
                .attr('x2', p2.x)
                .attr('y2', p2.y)
                .attr('stroke', colors.highlight)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '6,4');
        });
    });
}

export function drawNodes(
    g: D3Group,
    members: Person[],
    positions: Map<string, Position>,
    colors: ThemeColors,
    config: LayoutConfig
): void {
    //Draws the nodes for each person in the tree

    g.selectAll('.node').remove();
    const nodesGroup = g.append('g').attr('class', 'node');

    const groups = nodesGroup
        .selectAll<SVGGElement, Person>('g')
        .data(members)
        .enter()
        .append('g')
        .attr('transform', (d) => {
            const pos = positions.get(d.id) || { x: 0, y: 0 };
            return `translate(${pos.x}, ${pos.y})`;
        });


    const getName = (d: Person): string => {
        const parts = [d.firstName, d.middleNames, d.lastName].filter(Boolean);
        return parts.join(' ').trim() || 'Unknown';
    };

    const getBirthDeath = (d: Person): string => {
        const getYear = (dateStr?: string | Date | null): string => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return isNaN(date.getFullYear()) ? '' : date.getFullYear().toString();
        };

        const birthYear = getYear(d.dob);
        const deathYear = getYear(d.dod);

        if (!birthYear && !deathYear) return '';
        if (birthYear && !deathYear) return `${birthYear} - Living`;

        return `${birthYear || 'Unknown'} - ${deathYear}`;
    }

    // draws the main card rectable for the node
    groups
        .append('rect')
        .attr('x', -config.NODE_WIDTH / 2)
        .attr('y', -config.NODE_HEIGHT / 2)
        .attr('width', config.NODE_WIDTH)
        .attr('height', config.NODE_HEIGHT)
        .attr('rx', 8)
        .attr('fill', colors.secondaryBg)
        .attr('stroke', colors.accent1)
        .attr('stroke-width', 2);

    // draws the text for the node
    groups
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 5)
        .attr('fill', colors.textPrimary)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(getName);

    groups
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 25)
        .attr('fill', colors.textSecondary)
        .style('font-family', 'var(--font-primary)')
        .style('font-size', 'var(--font-xsmall)')
        .text(getBirthDeath);
}