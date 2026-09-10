import type { Person } from "$personTreeStore";
import type { PersonData } from "personStore";

export type RelationType = "parent" | "child" | "partner";

export function parseDob(dob: string | null | undefined): Date | null {
    if (!dob || typeof dob !== "string") return null;
    const trimmed = dob.trim();
    if (!trimmed) return null;

    //  YYYY-only format
    if (/^\d{4}$/.test(trimmed)) {
        return new Date(parseInt(trimmed, 10), 0, 1);
    }

    // ISO YYYY-MM-DD format
    const isoDate = new Date(trimmed);
    if (!isNaN(isoDate.getTime())) {
        return isoDate;
    }

    // DD/MM/YYYY or DD-MM-YYYY formats
    const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        if (!isNaN(date.getTime())) return date;
    }

    return null;
}

export function getExcludedRelationIds(
    relationType: RelationType | undefined,
    currentPerson: PersonData,
    allPeople: Person[]
): Set<string> {
    const treeMap = new Map(allPeople.map((p) => [p.id, p]));
    const excluded = new Set<string>();

    // Get all descendants down teh tree from current person's children
    function getDescendants(startIds: string[]): Set<string> {
        const result = new Set<string>();
        const queue = [...startIds];
        while (queue.length > 0) {
            const id = queue.shift()!;
            if (!result.has(id)) {
                result.add(id);
                const person = treeMap.get(id);
                if (person?.childrenIds) {
                    queue.push(...person.childrenIds);
                }
            }
        }
        return result;
    }

    // get all ancestors up the tree from current person's parents
    function getAncestors(startIds: string[]): Set<string> {
        const result = new Set<string>();
        const queue = [...startIds];
        while (queue.length > 0) {
            const id = queue.shift()!;
            if (!result.has(id)) {
                result.add(id);
                const person = treeMap.get(id);
                if (person?.parentIds) {
                    queue.push(...person.parentIds);
                }
            }
        }
        return result;
    }

    const descendants = getDescendants(currentPerson.childrenIds || []);
    const ancestors = getAncestors(currentPerson.parentIds || []);

    // partners descendants
    const descendantPartners = new Set<string>();
    descendants.forEach((id) => {
        treeMap.get(id)?.partnerIds?.forEach((partnerId) => descendantPartners.add(partnerId));
    });

    // partners ancestors
    const ancestorPartners = new Set<string>();
    ancestors.forEach((id) => {
        treeMap.get(id)?.partnerIds?.forEach((partnerId) => ancestorPartners.add(partnerId));
    });

    if (relationType === "parent") {
        // Parents cannot be descendants, descendants' partners, or existing ancestors
        descendants.forEach((id) => excluded.add(id));
        descendantPartners.forEach((id) => excluded.add(id));
        ancestors.forEach((id) => excluded.add(id));
    } else if (relationType === "child") {
        // Children cannot be ancestors, ancestors' partners, or existing descendants
        ancestors.forEach((id) => excluded.add(id));
        ancestorPartners.forEach((id) => excluded.add(id));
        descendants.forEach((id) => excluded.add(id));
        descendantPartners.forEach((id) => excluded.add(id));
    } else if (relationType === "partner") {
        // Exclude direct ancestors, descendants, child's partners, and parent's partners
        ancestors.forEach((id) => excluded.add(id));
        descendants.forEach((id) => excluded.add(id));
        descendantPartners.forEach((id) => excluded.add(id));
        ancestorPartners.forEach((id) => excluded.add(id));
    }

    return excluded;
}

export function getSuggestedPeople(
    relationType: RelationType | undefined,
    currentPerson: PersonData,
    allPeople: Person[],
    excludeIds: string[] = []
): Person[] {
    const treeMap = new Map(allPeople.map((p) => [p.id, p]));
    const treeExclusions = getExcludedRelationIds(relationType, currentPerson, allPeople);

    const totalExcluded = new Set([
        ...excludeIds,
        ...(currentPerson.parentIds || []),
        ...(currentPerson.partnerIds || []),
        ...(currentPerson.childrenIds || []),
        ...treeExclusions,
    ]);

    const candidates = allPeople.filter((p) => !totalExcluded.has(p.id));
    const candidatesMap = new Map(candidates.map((p) => [p.id, p]));

    // Last 3 created should always be ranked at the top
    const recentPeople = [...allPeople].reverse().slice(0, 3);
    const recentIds: string[] = [];
    for (const p of recentPeople) {
        if (candidatesMap.has(p.id)) {
            recentIds.push(p.id);
        }
    }

    if (!relationType) {
        return recentIds.map((id) => candidatesMap.get(id)!).filter(Boolean);
    }

    const currentDob = parseDob(currentPerson.dob);
    const matchedIds: string[] = [];

    candidates.forEach((person) => {
        const personDob = parseDob(person.dob);

        if (relationType === "parent") {
            // Suggested parent = DOB older than the created person
            if (currentDob && personDob && personDob < currentDob) {
                matchedIds.push(person.id);
            }
        } else if (relationType === "partner") {
            // Suggested partner: -+15 years of created person
            if (currentDob && personDob) {
                const yearDiff = Math.abs(currentDob.getTime() - personDob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                if (yearDiff <= 15) {
                    matchedIds.push(person.id);
                }
            }
        } else if (relationType === "child") {
            // Younger than created person
            const isYounger = Boolean(currentDob && personDob && personDob > currentDob);
            const hasNoParents = !person.parentIds || person.parentIds.length === 0;

            // If created person has children, suggest that child's other parent/partner
            let sharesChild = false;
            if (currentPerson.childrenIds && currentPerson.childrenIds.length > 0) {
                sharesChild = Boolean(
                    person.childrenIds?.some((childId) => currentPerson.childrenIds.includes(childId))
                );
            }

            let isPartnersChild = false;
            if (currentPerson.partnerIds && currentPerson.partnerIds.length > 0) {
                isPartnersChild = currentPerson.partnerIds.some((partnerId) => {
                    const partner = treeMap.get(partnerId);
                    return partner?.childrenIds?.includes(person.id) || person.parentIds?.includes(partnerId);
                });
            }

            if (isYounger || hasNoParents || sharesChild) {
                matchedIds.push(person.id);
            }
        }
    });

    const finalResultIds: string[] = [];
    const addedSet = new Set<string>();

    for (const id of recentIds) {
        if (!addedSet.has(id)) {
            addedSet.add(id);
            finalResultIds.push(id);
        }
    }

    return finalResultIds.map((id) => candidatesMap.get(id)!).filter(Boolean);
}