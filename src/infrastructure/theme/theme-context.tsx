/**
 * Theme Context Provider
 * 
 * Provides theme (light/dark) to all components.
 * Persists theme preference using AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@weighsoft_theme_mode';

export interface Theme {
  mode: 'light' | 'dark';
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  surface: {
    default: string;
    raised: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };
  border: {
    default: string;
    strong: string;
    focus: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primaryDisabled: string;
    secondary: string;
    secondaryHover: string;
  };
  status: {
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    error: string;
    errorBackground: string;
    info: string;
    infoBackground: string;
  };
  shadow: {
    small: string;
    medium: string;
    large: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5',
    elevated: '#FFFFFF',
  },
  surface: {
    default: '#FFFFFF',
    raised: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#212121',
    secondary: '#616161',
    tertiary: '#9E9E9E',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
    link: '#1976D2',
  },
  border: {
    default: '#E0E0E0',
    strong: '#BDBDBD',
    focus: '#1976D2',
  },
  interactive: {
    primary: '#1976D2',
    primaryHover: '#1565C0',
    primaryActive: '#0D47A1',
    primaryDisabled: '#90CAF9',
    secondary: '#F5F5F5',
    secondaryHover: '#EEEEEE',
  },
  status: {
    success: '#2E7D32',
    successBackground: '#E8F5E9',
    warning: '#F9A825',
    warningBackground: '#FFF8E1',
    error: '#C62828',
    errorBackground: '#FFEBEE',
    info: '#1565C0',
    infoBackground: '#E3F2FD',
  },
  shadow: {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#252525',
    elevated: '#2D2D2D',
  },
  surface: {
    default: '#1E1E1E',
    raised: '#2D2D2D',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    tertiary: '#757575',
    disabled: '#505050',
    inverse: '#212121',
    link: '#64B5F6',
  },
  border: {
    default: '#333333',
    strong: '#505050',
    focus: '#64B5F6',
  },
  interactive: {
    primary: '#1E88E5',
    primaryHover: '#42A5F5',
    primaryActive: '#1565C0',
    primaryDisabled: '#0D47A1',
    secondary: '#2D2D2D',
    secondaryHover: '#3D3D3D',
  },
  status: {
    success: '#66BB6A',
    successBackground: '#1B3D1F',
    warning: '#FFB74D',
    warningBackground: '#3D3012',
    error: '#EF5350',
    errorBackground: '#3D1B1B',
    info: '#42A5F5',
    infoBackground: '#12283D',
  },
  shadow: {
    small: '0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.4)',
    large: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
};

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeMode(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadThemePreference();
  }, []);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    // Persist preference
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch((error) => {
      console.error('Failed to save theme preference:', error);
    });
  };

  const setTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    // Persist preference
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error) => {
      console.error('Failed to save theme preference:', error);
    });
  };

  const value = {
    theme,
    isDark,
    themeMode,
    toggleTheme,
    setTheme,
  };

  // Don't render until theme preference is loaded to avoid flash
  if (!isInitialized) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

