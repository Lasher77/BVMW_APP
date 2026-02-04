export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  muted: string;
  border: string;
  shadow: string;
  card: string;
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
  radii: typeof radii;
}

const lightColors: ThemeColors = {
  primary: '#E30613',
  primaryDark: '#B0000D',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceHighlight: '#EEEEEE',
  text: '#1B1B1B',
  textSecondary: '#4B5563',
  muted: '#6B7280',
  border: '#E5E7EB',
  shadow: '#0000001A',
  card: '#FFFFFF',
  // Status colors
  success: '#047857',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#3B82F6',
};

const darkColors: ThemeColors = {
  primary: '#E30613',
  primaryDark: '#FF1A27',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceHighlight: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  muted: '#9CA3AF',
  border: '#3A3A3A',
  shadow: '#00000040',
  card: '#1E1E1E',
  // Status colors
  success: '#10B981',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#60A5FA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  heading: 24,
  subheading: 18,
  body: 16,
  caption: 14,
};

export const radii = {
  sm: 8,
  md: 16,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  typography,
  radii,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  typography,
  radii,
};

export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}

// Legacy export for backward compatibility during migration
export const colors = lightColors;
