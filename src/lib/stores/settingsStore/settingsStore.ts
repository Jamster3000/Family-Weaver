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

export function applyFontFamily(selectedOption: string) {
    let fontStack = "'Lora'";

    if (selectedOption.startsWith("Lora")) {
        fontStack = "'Lora'";
    } else if (selectedOption.startsWith("Hyperlegible")) {
        fontStack = "'HyperLegible'";
    } else if (selectedOption.startsWith("OpenDyslexic")) {
        fontStack = "'OpenDyslexic'";
    } else if (selectedOption.startsWith("Lexend")) {
        fontStack = "'Lexend'";
    } else if (selectedOption.startsWith("Merriweather")) {
        fontStack = "'Merriweather'";
    }

    document.documentElement.style.setProperty("--font-primary", fontStack);
    document.documentElement.setAttribute("data-font-family", fontStack);
}