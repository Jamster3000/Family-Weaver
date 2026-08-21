import { writable, get } from 'svelte/store';

export interface Tree {
    id: number;
    name: string;
    active_tree: boolean;
    created_at: string;
    updated_at: string;
}

export const activeTree = writable<Tree | null>(null);

export function setActiveTree(tree: Tree) {
    activeTree.set(tree);
}

export function getActiveTree(): Tree | null {
    return get(activeTree);
}