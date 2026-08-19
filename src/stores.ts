import { writable, get } from 'svelte/store';

// ====================
// Network Store
// ====================
export const networkStore = writable(null);

// ====================
// Tree Store
// ====================
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

// ====================
// Person Store
// ====================

export interface TimelineEntry {
    id: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
}

export interface MarriageDetails {
    marriage_date: string | null;
    marriage_location: string | null;
    divorce_date: string | null;
    divorce_location: string | null;
}

export interface PersonData {
    firstName: string;
    middleNames: string;
    lastName: string;
    dob: string | null;
    birthLocation: string;
    dod: string | null;
    deathLocation: string;
    importantNotes: string;
    parentIds: string[];
    partnerIds: string[];
    childrenIds: string[];
    marriages: Record<string, MarriageDetails>;
    lifeEvents: TimelineEntry[];
    workEducation: TimelineEntry[];
    placesLived: TimelineEntry[];
}

export function createDefaultPersonData(): PersonData {
    return {
        firstName: '',
        middleNames: '',
        lastName: '',
        dob: null,
        birthLocation: '',
        dod: null,
        deathLocation: '',
        importantNotes: '',
        parentIds: [],
        partnerIds: [],
        childrenIds: [],
        marriages: {},
        lifeEvents: [],
        workEducation: [],
        placesLived: [],
    };
}

export const personData = writable<PersonData>(createDefaultPersonData());

export function resetPersonData() {
    personData.set(createDefaultPersonData());
}

export function updatePersonData(updates: Partial<PersonData>) {
    personData.update(data => ({ ...data, ...updates }));
}

export function getPersonData(): PersonData {
    return get(personData);
}

export function hasPersonChanged(): boolean {
    const data = get(personData);
    if (!data) return false;

    // Check if any string field contains actual non-whitespace text
    const stringFields: (keyof PersonData)[] = [
        'firstName',
        'middleNames',
        'lastName',
        'birthLocation',
        'deathLocation',
        'importantNotes'
    ];
    const hasString = stringFields.some(
        field => typeof data[field] === 'string' && (data[field] as string).trim().length > 0
    );
    if (hasString) return true;

    // Check dates
    if (data.dob || data.dod) return true;

    // Check array fields
    const arrayFields: (keyof PersonData)[] = [
        'parentIds',
        'partnerIds',
        'childrenIds',
        'lifeEvents',
        'workEducation',
        'placesLived'
    ];
    const hasArrayItem = arrayFields.some(
        field => Array.isArray(data[field]) && (data[field] as any[]).length > 0
    );
    if (hasArrayItem) return true;

    // Check marriages
    if (data.marriages && Object.keys(data.marriages).length > 0) return true;

    return false;
}

// ============================================================================
// Zoom Store
// ============================================================================
export function zoomIn() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        const currentPos = network.getViewPosition();
        network.moveTo({
            position: currentPos,
            scale: currentScale * 1.5,
            animation: { duration: 400 }
        });
    }
}

export function zoomOut() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        const currentPos = network.getViewPosition();
        network.moveTo({
            position: currentPos,
            scale: currentScale / 1.5,
            animation: { duration: 400 }
        });
    }
}