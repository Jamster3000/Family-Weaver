import { type Settings, getSetting } from '$settingsStore';

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

export type AppearanceMode = 'Light' | 'Dark' | 'System' | string;

export function applyVisualSettings(settings: Settings[]) {
    applyAppearanceMode(settings);
    applyHighContrast(settings);
    applyColourblindMode(settings);
    applyReduceMotion(settings);
    applyLineSpacing(settings);
    applyLetterSpacing(settings);
    applyFontFamily(settings);
    applyFontScale(settings);
}

export function applyAppearanceMode(settings: Settings[], mode?: AppearanceMode) {
    const root = document.documentElement;

    //get some settings from the store
    const activeMode = mode ?? getSetting.text(settings, "appearance_mode", "Dark");
    const isHighContrast = getSetting.bool(settings, "high_contrast_mode") || getSetting.bool(settings, "high_contrast");

    // Get reduce motion (used to know whether to change appearance immediately or gradually)
    const reduceMotionSetting = getSetting.bool(settings, "reduce_motion");
    const isReducedMotion = reduceMotionSetting ||
        root.getAttribute("data-reduce-motion") === "true" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lowerMode = activeMode.toLowerCase();
    const isDark = lowerMode.includes("dark") || lowerMode === "system";

    let targetTheme = lowerMode;
    if (isHighContrast) {
        targetTheme = isDark ? "high-contrast-dark" : "high-contrast-light";
    }

    // Handle theme transition animation state
    if (transitionTimer) clearTimeout(transitionTimer);

    if (!isReducedMotion) {
        root.classList.add("theme-transitioning");
        transitionTimer = setTimeout(() => {
            root.classList.remove("theme-transitioning");
        }, 1550);
    } else {
        root.classList.remove("theme-transitioning");
    }

    root.setAttribute("data-theme", targetTheme);
}

export function applyHighContrast(settings: Settings[]) {
    const highContrast = getSetting.bool(settings, "high_contrast");
    document.documentElement.classList.toggle("high-contrast", highContrast);
}

export function applyColourblindMode(settings: Settings[]) {
    let mode = "off";

    const selectedOption = getSetting.text(settings, "colorblind_mode");

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

export function applyReduceMotion(settings: Settings[]) {
    const reduceMotion = getSetting.bool(settings, "reduce_motion");
    document.documentElement.setAttribute(
        "data-reduce-motion",
        reduceMotion ? "true" : "false"
    );
}

export function applyLineSpacing(settings: Settings[]) {
    const lineSpacing = getSetting.bool(settings, "increase_line_spacing");

    document.documentElement.setAttribute("data-increase-line-spacing",
        lineSpacing ? "true" : "false"
    );
}

export function applyLetterSpacing(settings: Settings[]) {
    const letterSpacing = getSetting.bool(settings, "increase_letter_spacing");

    document.documentElement.setAttribute("data-increase-letter-spacing",
        letterSpacing ? "true" : "false"
    );
}

export function applyFontFamily(settings: Settings[]) {
    const selectedOption = getSetting.text(settings, "font_family");

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

export function applyFontScale(settings: Settings[]) {
    const fontScale = getSetting.number(settings, "font_size");
    document.documentElement.style.setProperty("--font-scale", fontScale.toString());
}