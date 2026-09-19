import { writable } from 'svelte/store';
import type { PersonData } from '$personStore';

export interface Person extends PersonData {
    id: string;
    treeId: string;
    tree_id?: string;
}

export interface SelectedPerson {
    id?: string;
    treeId?: string;
    name?: string;
}

export const personTreeStore = writable<Person[]>([]);

export const selectedPersonStore = writable<SelectedPerson>({});

export function updatePersonTreeData(newPerson: Person) {
    personTreeStore.update((people) => {
        const map = new Map(people.map((p) => [p.id, { ...p }]));

        map.set(newPerson.id, { ...newPerson });

        newPerson.childrenIds?.forEach((childId) => {
            const child = map.get(childId);
            if (child) {
                const parents = child.parentIds || [];
                if (!parents.includes(newPerson.id)) {
                    child.parentIds = [...parents, newPerson.id];
                }
            }
        });

        newPerson.parentIds?.forEach((parentId) => {
            const parent = map.get(parentId);
            if (parent) {
                const children = parent.childrenIds || [];
                if (!children.includes(newPerson.id)) {
                    parent.childrenIds = [...children, newPerson.id];
                }
            }
        });

        newPerson.partnerIds?.forEach((partnerId) => {
            const partner = map.get(partnerId);
            if (partner) {
                const partners = partner.partnerIds || [];
                if (!partners.includes(newPerson.id)) {
                    partner.partnerIds = [...partners, newPerson.id];
                }
            }
        });

        return Array.from(map.values());
    });
}