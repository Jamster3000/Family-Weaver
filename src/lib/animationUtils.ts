
export function getAnimationDuration(): number {
    if (document.documentElement.getAttribute("data-reduce-motion") === "true") return 0;

    const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--svelte-transition-duration")
        .trim();

    return raw.endsWith("ms") ? parseFloat(raw) : (parseFloat(raw) * 1000 || 500);
}