import { create } from 'zustand';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  updateIsDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
  isDark: false,
  updateIsDark: (isDark) => set({ isDark }),
}));

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { mode, isDark, setMode, updateIsDark } = useThemeStore();

  // Determine actual theme based on mode
  const actualTheme = mode === 'system' ? systemColorScheme : mode;
  const isCurrentlyDark = actualTheme === 'dark';

  return {
    mode,
    setMode,
    isDark: isCurrentlyDark,
    updateIsDark,
    colors: isCurrentlyDark ? darkColors : lightColors,
  };
}

export const lightColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  text: '#1F2937',
  'text-secondary': '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#818CF8',
  secondary: '#A78BFA',
  accent: '#F472B6',
  text: '#F1F5F9',
  'text-secondary': '#CBD5E1',
  border: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
};
