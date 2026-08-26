export type AppearanceMode = "System" | "Light" | "Dark";

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export function applyTheme(mode: AppearanceMode) {
    const root = document.documentElement;

    if (transitionTimer) clearTimeout(transitionTimer);

    root.classList.add("theme-transitioning");

    root.setAttribute("data-theme", mode.toLowerCase());

    transitionTimer = setTimeout(() => {
        root.classList.remove("theme-transitioning");
    }, 1250);
}