import { type Settings, getSetting } from '$settingsStore';
import { applyTheme, type AppearanceMode, applyColorblindMode } from '$themeStore';

export function applyVisualSettings(settings: Settings[]) {
    const appearance = getSetting.text(settings, "appearance_mode");
    if (appearance) {
        applyTheme(appearance as AppearanceMode);
    }

    const highContrast = getSetting.bool(settings, "high_contrast");
    document.documentElement.classList.toggle("high-contrast", highContrast);

    const colorblind = getSetting.text(settings, 'colour_blind_mode');
    applyColorblindMode(colorblind);
}