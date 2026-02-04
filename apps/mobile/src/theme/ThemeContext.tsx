import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, getTheme } from './index';

const THEME_STORAGE_KEY = '@bvmw_theme_mode';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      })
      .catch(() => {
        // Ignore errors, use default
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {
      // Ignore storage errors
    });
  }, []);

  const resolvedMode = useMemo((): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      isDark: resolvedMode === 'dark',
    }),
    [theme, themeMode, setThemeMode, resolvedMode]
  );

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for just the colors
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}
