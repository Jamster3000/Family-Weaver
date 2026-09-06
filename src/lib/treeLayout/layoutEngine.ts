import type { Person, Position, LayoutConfig } from './models';

export function calculateLevels(members: Person[]): Map<string, number> {
    // Calculate the generational levels with a top down approach with bottom-up child relationships

    const levels = new Map<string, number>();
    const people = new Map<string, Person>(members.map((p) => [p.id, p]));

    //set everyone at level 0
    members.forEach((p) => levels.set(p.id, 0));

    let changed = true;
    let iterations = 0;

    while (changed && iterations < 50) {
        changed = false;
        iterations++;

        members.forEach((person) => {
            const currentLevel = levels.get(person.id) ?? 0;

            //push children down below parents
            if (person.childrenIds && person.childrenIds.length > 0) {
                person.childrenIds.forEach((cid) => {
                    const childLevel = levels.get(cid) ?? 0;
                    if (childLevel <= currentLevel) {
                        levels.set(cid, currentLevel + 1);
                        changed = true;
                    }
                });
            }

            // align partners to the same level
            if (person.partnerIds && person.partnerIds.length > 0) {
                person.partnerIds.forEach((pid) => {
                    const partnerLevel = levels.get(pid) ?? 0;
                    if (partnerLevel !== currentLevel) {
                        const maxLevel = Math.max(currentLevel, partnerLevel);
                        if (levels.get(person.id) !== maxLevel) {
                            levels.set(person.id, maxLevel);
                            changed = true;
                        }
                        if (levels.get(pid) !== maxLevel) {
                            levels.set(pid, maxLevel);
                            changed = true;
                        }
                    }
                });
            }
        });
    }

    const levelValues = Array.from(levels.values());
    const minLevel = levelValues.length > 0 ? Math.min(...levelValues) : 0;
    if (minLevel !== 0) {
        levels.forEach((lvl, id) => levels.set(id, lvl - minLevel));
    }

    return levels;
}

/*export function calculatePositions(
    members: Person[],
    config: LayoutConfig
): { positions: Map<string, Position>; levels: Map<string, number> } {
    // Combines all normalization and level calculation logic to produce
    // generational ranks into 2D coordinate pairs

    // Groups all members by their generational level with bottom-up sorting
    const levels = calculateLevels(members); // level each member sits on
    const people = new Map<string, Person>(members.map((p) => [p.id, p]));
    const positions = new Map<string, Position>();

    const byLevel = new Map<number, Person[]>();
    members.forEach((p) => {
        const lv = levels.get(p.id) || 0;
        if (!byLevel.has(lv)) byLevel.set(lv, []);
        byLevel.get(lv)!.push(p);
    });

    const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => b - a);

    // min distance between centers and two nodes next to each other
    const minNodeDistance = config.NODE_WIDTH + 30;

    // For each level, position people and their partners horizontally
    sortedLevels.forEach((level) => {
        const peopleAtLevel = byLevel.get(level) || [];
        const positioned = new Set<string>();

        peopleAtLevel.forEach((person) => {
            if (positioned.has(person.id)) return;

            const partners = (person.partnerIds || [])
                .map((pid) => people.get(pid))
                .filter(
                    (p): p is Person =>
                        Boolean(p) && levels.get(p!.id) === level && !positioned.has(p!.id)
                );

            let x: number;

            // THe person has a partner
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
                        x = centerX - config.PARTNER_SPACING / 2;
                    } else {
                        x = 0;
                    }
                } else {
                    x = 0;
                }

                positions.set(person.id, { x, y: level * config.LEVEL_HEIGHT });
                positions.set(partners[0].id, {
                    x: x + config.PARTNER_SPACING,
                    y: level * config.LEVEL_HEIGHT
                });
                positioned.add(person.id);
                positioned.add(partners[0].id);
            } else { // Single parent/no partner at this level
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

                positions.set(person.id, { x, y: level * config.LEVEL_HEIGHT });
                positioned.add(person.id);
            }
        });

        const levelNodes = peopleAtLevel
            .map((p) => ({ id: p.id, pos: positions.get(p.id)! }))
            .filter((item) => Boolean(item.pos))
            .sort((a, b) => a.pos.x - b.pos.x);

        for (let i = 1; i < levelNodes.length; i++) {
            const prev = levelNodes[i - 1];
            const curr = levelNodes[i];

            const currentDist = curr.pos.x - prev.pos.x;
            if (currentDist < minNodeDistance) {
                const overlap = minNodeDistance - currentDist;
                curr.pos.x += overlap;
            }
        }
    });

    // nodes without children default to x=0, thus naturally leaning leaning to the right side
    // Get the extreme left and right coords, calculate midpoint difference and
    // shift every node horizontally so the tree is symmetrically centered at x = 0
    if (positions.size > 0) {
        const xs = Array.from(positions.values()).map((p) => p.x);
        const offset = -(Math.min(...xs) + Math.max(...xs)) / 2;
        positions.forEach((pos) => (pos.x += offset));
    }

    return { positions, levels };
}*/
export function calculatePositions(
    members: Person[],
    config: LayoutConfig
): { positions: Map<string, Position>; levels: Map<string, number>; seatedPairs: Set<string> } {
    // Combines all normalization and level calculation logic to produce
    // generational ranks into 2D coordinate pairs

    // Groups all members by their generational level with bottom-up sorting
    const levels = calculateLevels(members); // level each member sits on
    const people = new Map<string, Person>(members.map((p) => [p.id, p]));
    const positions = new Map<string, Position>();

    // Tracks which partnerIds pairs actually ended up seated next to each other as a
    // real two-person unit. A person can have multiple co-parents (blended families,
    // shared kids with no relationship, etc.) but can only be spatially adjacent to
    // one of them at a time - anything left over is positioned as its own singleton
    // unit. Consumers (the "couple" line renderer) should only treat pairs in this
    // set as visually partnered; anything else is a co-parent link, not a real seat.
    const seatedPairs = new Set<string>();

    const byLevel = new Map<number, Person[]>();
    members.forEach((p) => {
        const lv = levels.get(p.id) || 0;
        if (!byLevel.has(lv)) byLevel.set(lv, []);
        byLevel.get(lv)!.push(p);
    });

    const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => a - b);

    // min distance between centers and two nodes next to each other
    const minNodeDistance = config.NODE_WIDTH + 30;

    // For each level, position people and their partners horizontally
    sortedLevels.forEach((level) => {
        const peopleAtLevel = byLevel.get(level) || [];

        // Group people on this level into family units
        // Pair actual partners together first (partners may have completely different
        // parentIds if they married in, so this must NOT be restricted to siblings)
        const units: Person[][] = [];
        const processed = new Set<string>();
        peopleAtLevel.forEach((person) => {
            if (processed.has(person.id)) return;

            const partner = (person.partnerIds || [])
                .map((pid) => people.get(pid))
                .find((p) => p && levels.get(p.id) === level && !processed.has(p!.id));

            if (partner) {
                units.push([person, partner]);
                processed.add(person.id);
                processed.add(partner.id);
                seatedPairs.add([person.id, partner.id].sort().join('-'));
            } else {
                units.push([person]);
                processed.add(person.id);
            }
        });

        // Initial X assignment per unit based on children
        const unitsWithIdeal = units.map((unit) => {
            let idealX = 0;
            const parentXs: number[] = [];
            unit.forEach((p) => {
                members.forEach((potentialParent) => {
                    if (
                        potentialParent.childrenIds?.includes(p.id) &&
                        positions.has(potentialParent.id)
                    ) {
                        parentXs.push(positions.get(potentialParent.id)!.x);
                    }
                });
            });

            if (parentXs.length > 0) {
                idealX = parentXs.reduce((a, b) => a + b, 0) / parentXs.length;
            } else {
                const allChildren = new Set<string>();
                unit.forEach((p) => (p.childrenIds || []).forEach((cid) => allChildren.add(cid)));

                if (allChildren.size > 0) {
                    const childXs = Array.from(allChildren)
                        .map((cid) => positions.get(cid)?.x)
                        .filter((x): x is number => x !== undefined);
                    if (childXs.length > 0) {
                        idealX = childXs.reduce((a, b) => a + b, 0) / childXs.length;
                    }
                }
            }
            return { unit, idealX };
        });

        // sort family UNITS left to right by midpoint X position
        unitsWithIdeal.sort((a, b) => {
            let orderDiff = 0;
            members.forEach((parent) => {
                if (parent.childrenIds) {
                    const indicesA = a.unit.map(p => parent.childrenIds!.indexOf(p.id)).filter(idx => idx !== -1);
                    const indicesB = b.unit.map(p => parent.childrenIds!.indexOf(p.id)).filter(idx => idx !== -1);
                    if (indicesA.length > 0 && indicesB.length > 0) {
                        const minA = Math.min(...indicesA);
                        const minB = Math.min(...indicesB);
                        if (minA !== minB) {
                            orderDiff = minA - minB;
                        }
                    }
                }
            });
            if (orderDiff !== 0) return orderDiff;

            if (Math.abs(a.idealX - b.idealX) > 1) {
                return a.idealX - b.idealX;
            }
            const pA = a.unit[0];
            const pB = b.unit[0];
            let indexA = Infinity;
            let indexB = Infinity;
            members.forEach((parent) => {
                if (parent.childrenIds) {
                    const idxA = parent.childrenIds.indexOf(pA.id);
                    const idxB = parent.childrenIds.indexOf(pB.id);
                    if (idxA !== -1) indexA = Math.min(indexA, idxA);
                    if (idxB !== -1) indexB = Math.min(indexB, idxB);
                }
            });
            return indexA - indexB;
        });

        // horizontal collision pass operating on UNITS to guarantee partners are never seperated
        let currentRightEdge = -Infinity;

        unitsWithIdeal.forEach(({ unit, idealX }) => {
            const unitWidth = unit.length > 1 ? config.PARTNER_SPACING : 0;

            const requiredLeftEdge = currentRightEdge === -Infinity
                ? idealX - (unitWidth / 2)
                : currentRightEdge + minNodeDistance;

            const finalLeftEdge = Math.max(idealX - (unitWidth / 2), requiredLeftEdge);

            // Assign initial positions for people in this unit
            if (unit.length === 1) {
                positions.set(unit[0].id, { x: finalLeftEdge, y: level * config.LEVEL_HEIGHT });
            } else {
                positions.set(unit[0].id, { x: finalLeftEdge, y: level * config.LEVEL_HEIGHT });
                positions.set(unit[1].id, {
                    x: finalLeftEdge + config.PARTNER_SPACING,
                    y: level * config.LEVEL_HEIGHT
                });
            }

            currentRightEdge = finalLeftEdge + unitWidth;
        });
    });

    // nodes without children default to x=0, thus naturally leaning leaning to the right side
    // Get the extreme left and right coords, calculate midpoint difference and
    // shift every node horizontally so the tree is symmetrically centered at x = 0
    if (positions.size > 0) {
        const xs = Array.from(positions.values()).map((p) => p.x);
        const offset = -(Math.min(...xs) + Math.max(...xs)) / 2;
        positions.forEach((pos) => (pos.x += offset));
    }

    return { positions, levels, seatedPairs };
}