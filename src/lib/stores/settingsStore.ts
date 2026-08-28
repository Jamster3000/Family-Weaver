import { writable, get } from 'svelte/store';

export type Value =
    | { Text: string }
    | { Bool: boolean }
    | { Int: number }
    | { Float: number };

export type ValueType =
    | { Enum: string[] }
    | 'Bool'
    | 'Int'
    | 'Float'
    | 'Action';

export interface Settings {
    key: string;
    category: string;
    name: string;
    short_description: string;
    long_description: string;
    search_terms: string[];
    value_type: ValueType;
    default: Value | null;
    min: Value | null;
    max: Value | null;
    value: Value | null;
}

export const settingsData = writable<Settings[]>([]);

export function updateSettings(updates: Partial<Settings>[]) {
    settingsData.update(data => {
        const updatedData = [...data];
        for (const update of updates) {
            const index = updatedData.findIndex(item => item.key === update.key);
            if (index !== -1) {
                updatedData[index] = { ...updatedData[index], ...update };
            }
        }
        return updatedData;
    });
}

export function getSettings(): Settings[] {
    return get(settingsData);
}

export function setSettings(newSettings: Settings[]) {
    settingsData.set(newSettings);
}

export const getSetting = {
    bool: (settings: Settings[], key: string, fallback = false): boolean => {
        const item = settings.find(s => s.key === key);
        return item?.value && "Bool" in item.value ? item.value.Bool : fallback;
    },

    text: (settings: Settings[], key: string, fallback = ""): string => {
        const item = settings.find(s => s.key === key);
        return item?.value && "Text" in item.value ? item.value.Text : fallback;
    },

    number: (settings: Settings[], key: string, fallback = 0): number => {
        const item = settings.find(s => s.key === key);
        if (!item?.value) return fallback;
        if ("Int" in item.value) return item.value.Int;
        if ("Float" in item.value) return item.value.Float;
        return fallback;
    }
};