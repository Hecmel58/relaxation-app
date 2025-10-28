// TEMA RENK PALETİ
export const colors = {
  light: {
    // Background
    background: '#f3f4f6',
    surface: '#ffffff',
    card: '#ffffff',

    // Text
    primary: '#1e293b',
    secondary: '#64748b',
    tertiary: '#94a3b8',

    // Brand
    brand: '#4f7aef',
    brandLight: '#6b93f4',
    brandDark: '#3b5ed4',

    // Accent
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Borders
    border: '#e2e8f0',
    borderLight: '#cbd5e1',

    // Input
    input: '#f8fafc',
    inputBorder: '#cbd5e1',
    placeholder: '#94a3b8',

    // Shadow
    shadow: '#000000',
  },
  dark: {
    // Background
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',

    // Text
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',

    // Brand
    brand: '#6b93f4',
    brandLight: '#8baaf6',
    brandDark: '#4f7aef',

    // Accent
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',

    // Borders
    border: '#334155',
    borderLight: '#475569',

    // Input
    input: '#0f172a',
    inputBorder: '#334155',
    placeholder: '#64748b',

    // Shadow
    shadow: '#000000',
  },
};

export type ColorScheme = typeof colors.light;