import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  mode: Theme;
  setMode: (mode: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof darkColors;
  c: typeof darkColors;
};

const darkColors = {
  bg:           "#09090b",
  card:         "#111111",
  border:       "#1f1f1f",
  borderStrong: "#3f3f46",
  textPrimary:  "#f4f4f5",
  textSecondary:"#a1a1aa",
  textMuted:    "#52525b",
  textFaint:    "#3f3f46",
  input:        "#0a0a0a",
  pillBg:       "#18181b",
  iconMuted:    "#52525b",
  xpBar:        "#ffffff",
  btnBg:        "#ffffff",
  btnText:      "#000000",
  danger:       "#ef4444",
  dangerMuted:  "#f87171",
};

const lightColors = {
  bg:           "#f9fafb",
  card:         "#ffffff",
  border:       "#e5e7eb",
  borderStrong: "#d1d5db",
  textPrimary:  "#111827",
  textSecondary:"#374151",
  textMuted:    "#6b7280",
  textFaint:    "#9ca3af",
  input:        "#f3f4f6",
  pillBg:       "#f3f4f6",
  iconMuted:    "#9ca3af",
  xpBar:        "#15803d",
  btnBg:        "#111827",
  btnText:      "#ffffff",
  danger:       "#ef4444",
  dangerMuted:  "#f87171",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  mode: "dark",
  setMode: () => {},
  toggleTheme: () => {},
  isDark: true,
  colors: darkColors,
  c: darkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((saved) => {
      if (saved === "light" || saved === "dark") setTheme(saved);
    });
  }, []);

  const setMode = async (mode: Theme) => {
    if (mode === "system") {
      // For now, map system to dark mode by default
      mode = "dark";
    }
    setTheme(mode);
    await AsyncStorage.setItem("theme", mode);
  };

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode: theme,
        setMode,
        toggleTheme,
        isDark: theme === "dark",
        colors: theme === "dark" ? darkColors : lightColors,
        c: theme === "dark" ? darkColors : lightColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}