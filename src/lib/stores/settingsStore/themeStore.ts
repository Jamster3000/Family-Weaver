import { getSettings } from "$settingsStore";

export type AppearanceMode = "System" | "Light" | "Dark";

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export function applyTheme(mode?: AppearanceMode) {
    const root = document.documentElement;
    const settings = getSettings();

    // Read the appearance mode from store.
    const appearanceSetting = settings.find((s) => s.key === "appearance_mode");
    const activeMode = mode ?? (appearanceSetting?.value && "Text" in appearanceSetting.value ? appearanceSetting.value.Text : "Dark");

    // read the high contrast mode from store.
    const hcSetting = settings.find((s) => s.key === "high_contrast_mode");
    const isHighContrast = hcSetting?.value && "Bool" in hcSetting.value ? hcSetting.value.Bool : false;

    // Determine if the active mode is dark or system
    const isDark = activeMode.toLowerCase().includes("dark") || activeMode.toLowerCase() === "system";

    // Determine the target theme based on the active mode and high contrast setting
    let targetTheme = activeMode.toLowerCase();
    if (isHighContrast) {
        targetTheme = isDark ? "high-contrast-dark" : "high-contrast-light";
    }

    if (transitionTimer) clearTimeout(transitionTimer);

    root.classList.add("theme-transitioning");
    root.setAttribute("data-theme", targetTheme);

    transitionTimer = setTimeout(() => {
        root.classList.remove("theme-transitioning");
    }, 1250);
}

export function applyColorblindMode(selectedOption: string) {
    let mode = "off";

    const lower = selectedOption.toLowerCase();
    if (lower.includes("protanopia")) {
        mode = "protanopia";
    } else if (lower.includes("deuteranopia")) {
        mode = "deuteranopia";
    } else if (lower.includes("tritanopia")) {
        mode = "tritanopia";
    } else if (lower.includes("achromatopsia")) {
        mode = "achromatopsia";
    }

    if (mode === "off") {
        document.documentElement.removeAttribute("data-colorblind");
    } else {
        document.documentElement.setAttribute("data-colorblind", mode);
    }
}