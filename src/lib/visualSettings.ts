import type { Settings } from '$settingsStore';
import { applyTheme,type AppearanceMode } from '$themeStore';

export function applyVisualSettings(settings: Settings[]) {
    const getBool = (key: string) => {
        const s = settings.find(item => item.key === key);
        return s?.value && "Bool" in s.value ? s.value.Bool : false
    }

    const getText = (key: string) => {
        const s = settings.find(item => item.key === key);
        return s?.value && "Text" in s.value ? s.value.Text : ""
    }

    const appearance = getText("appearance_mode");
    if (appearance) {
        applyTheme(appearance as AppearanceMode);
    }

    const highContrast = getBool("high_contrast");
    document.documentElement.classList.toggle("high-contrast", highContrast);

    const colorblind = getText('colorblind_mode');
    if (colorblind) {
        document.documentElement.setAttribute('data-colorblind', colorblind.toLowerCase());
    } else {
        document.documentElement.removeAttribute('data-colorblind');
    }
}