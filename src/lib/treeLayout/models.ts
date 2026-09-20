import type { Person } from '$personTreeStore';

export type { Person };

export interface Position {
    x: number;
    y: number;
}

export interface ThemeColors {
    primaryBg: string;
    secondaryBg: string;
    accent1: string;
    accent2: string;
    textPrimary: string;
    textSecondary: string;
    highlight: string;
    cardBorder: string;
    selectedBorder: string;
}

export const DEFAULT_THEME_COLORS: ThemeColors = {
    primaryBg: 'var(--primary-background)',
    secondaryBg: 'var(--secondary-background)',
    accent1: 'var(--primary-colour)',
    accent2: 'var(--secondary-colour)',
    textPrimary: 'var(--text-colour)',
    textSecondary: 'var(--text-colour)',
    highlight: 'var(--border-colour)',
    cardBorder: 'var(--code-background)',
    selectedBorder: 'var(--secondary-colour)'
};

export interface LayoutConfig {
    LEVEL_HEIGHT: number;
    PARTNER_SPACING: number;
    NODE_WIDTH: number;
    NODE_HEIGHT: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
    LEVEL_HEIGHT: 200,
    PARTNER_SPACING: 300,
    NODE_WIDTH: 180,
    NODE_HEIGHT: 100,
};

export interface LayoutOptions {
    colors?: Partial<ThemeColors>;
    config?: Partial<LayoutConfig>;
    toolbarSelector?: string;
    selectedPersonId?: string | null;
    onSelectPerson?: ((person: Person | null) => void);
}