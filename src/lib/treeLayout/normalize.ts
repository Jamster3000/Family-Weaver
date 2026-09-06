import type { Person } from '$personTreeStore';

export function normalizeMembers(members: Person[]): Person[] {
    // Normalize members, auto link parents, children and partners.

    const map = new Map<string, Person>();

    // Creates a copied map of all members and person data
    members.forEach((m) => {
        map.set(m.id, {
            ...m,
            parentIds: [...(m.parentIds || [])],
            childrenIds: [...(m.childrenIds || [])],
            partnerIds: [...(m.partnerIds || [])]
        });
    });

    // Loop through every person to check and sort out 3 relationship directions
    map.forEach((person) => {
        // Child to parent/co-parent.
        person.childrenIds?.forEach((childId) => {
            const child = map.get(childId);
            if (child) {
                if (!child.parentIds?.includes(person.id)) {
                    child.parentIds.push(person.id);
                }

                // Auto-link co-parents for horizontal partner spacing
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

        person.parentIds?.forEach((parentId) => {
            const parent = map.get(parentId);
            if (parent && !parent.childrenIds?.includes(person.id)) {
                parent.childrenIds.push(person.id);
            }
        });

        person.partnerIds?.forEach((partnerId) => {
            const partner = map.get(partnerId);
            if (partner && !partner.partnerIds?.includes(person.id)) {
                partner.partnerIds.push(person.id);
            }
        });
    });

    return Array.from(map.values());
}