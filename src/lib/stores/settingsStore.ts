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
    step: Value | null;
    max: Value | null;
    value: Value | null;
}

export type ValueProp = 'value' | 'default' | 'min' | 'max' | 'step';

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
    /** Returns the whole Setting object matching the key */
    item: (settings: Settings[], key: string): Settings | undefined => {
        return settings.find(s => s.key === key);
    },

    /** Returns ANY property on the Setting object (e.g. 'name', 'short_description', 'default') */
    prop: <K extends keyof Settings>(settings: Settings[], key: string, prop: K): Settings[K] | undefined => {
        const item = settings.find(s => s.key === key);
        return item ? item[prop] : undefined;
    },

    /** Extracts boolean from 'value', 'default', etc. (defaults to 'value') */
    bool: (settings: Settings[], key: string, prop: ValueProp = 'value', fallback = false): boolean => {
        const item = settings.find(s => s.key === key);
        const val = item ? item[prop] : null;
        return val && typeof val === 'object' && "Bool" in val ? val.Bool : fallback;
    },

    /** Extracts string from 'value', 'default', etc. (defaults to 'value') */
    text: (settings: Settings[], key: string, prop: ValueProp = 'value', fallback = ""): string => {
        const item = settings.find(s => s.key === key);
        const val = item ? item[prop] : null;
        return val && typeof val === 'object' && "Text" in val ? val.Text : fallback;
    },

    /** Extracts number from 'value', 'default', 'min', 'max', 'step' (defaults to 'value') */
    number: (settings: Settings[], key: string, prop: ValueProp = 'value', fallback = 0): number => {
        const item = settings.find(s => s.key === key);
        const val = item ? item[prop] : null;
        if (!val || typeof val !== 'object') return fallback;
        if ("Int" in val) return val.Int;
        if ("Float" in val) return val.Float;
        return fallback;
    }
};