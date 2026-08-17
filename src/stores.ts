import { writable, get } from 'svelte/store';

export const networkStore = writable(null);

//Hold all person data in stores so other components can
//access easily and send the person data to rust easily
export interface PersonData {
    firstName: string;
    middleNames: string;
    lastName: string;
    dob: string | null;
    birthLocation: string;
    dod: string | null;
    deathLocation: string;
    keyFacts: string;
    parentIds: string[];
    partnerIds: string[];
    childrenIds: string[];
    lifeEvents: TimelineEntry[];
    workEducation: TimelineEntry[];
    placesLived: TimelineEntry[];
}

export interface TimelineEntry {
    id: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    location: string | null;
}

const defaultPersonData: PersonData = {
    firstName: '',
    middleNames: '',
    lastName: '',
    dob: null,
    birthLocation: '',
    dod: null,
    deathLocation: '',
    keyFacts: '',
    parentIds: [],
    partnerIds: [],
    childrenIds: [],
    lifeEvents: [],
    workEducation: [],
    placesLived: [],
};

export const personData = writable<PersonData>(defaultPersonData);

export function resetPersonData() {
    personData.set(defaultPersonData);
}

export function updatePersonData(updates: Partial<PersonData>) {
    personData.update(data => ({ ...data, ...updates }));
}

export function hasPersonChanged(): boolean {
    const currentData = get(personData);
    return JSON.stringify(currentData) !== JSON.stringify(defaultPersonData);
}

export function zoomIn() {
    const network = get(networkStore);
    if (network) {
        const currentScale = network.getScale();
        network.setOptions({
            interaction: { navigationButtons: true, keyboard: true }
        });
        // adjust the canvas to zoom
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