"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { THEMES, THEME_CATEGORIES, getTimeOfDayTheme, getActiveFestivalTheme } from "@/lib/themes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const ThemeContext = createContext({
  mode: "auto-time", // 'auto-festival' | 'auto-time' | 'manual'
  theme: THEMES[3], // Resolved active theme object
  activeFestival: null,
  setThemeMode: () => {},
  selectManualTheme: () => {},
  allThemes: THEMES,
  getTimeOfDayTheme,
  getActiveFestivalTheme,
  isAdmin: false
});

export const ThemeProvider = ({ children }) => {
  const { isAdmin } = useAuth();
  const [mode, setMode] = useState("auto-time");
  const [manualThemeId, setManualThemeId] = useState("time-night");
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("finsage_theme_mode");
    const savedManualId = localStorage.getItem("finsage_theme_id");

    if (savedMode && ["auto-festival", "auto-time", "manual"].includes(savedMode)) {
      setMode(savedMode);
    }
    if (savedManualId && THEMES.some((t) => t.id === savedManualId)) {
      setManualThemeId(savedManualId);
    }
  }, []);

  // Timer to check for hour changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const nowHour = new Date().getHours();
      if (nowHour !== currentHour) {
        setCurrentHour(nowHour);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentHour]);

  // Determine active festival for current date
  const activeFestival = getActiveFestivalTheme();

  // Resolve current active theme object with admin protection
  const resolveTheme = useCallback(() => {
    if (mode === "manual") {
      const found = THEMES.find((t) => t.id === manualThemeId);
      if (found) {
        // If festival theme selected by non-admin, fallback to time theme
        if (found.category === THEME_CATEGORIES.FESTIVAL && !isAdmin) {
          return getTimeOfDayTheme(currentHour);
        }
        return found;
      }
      return THEMES.find((t) => t.id === "time-night");
    }

    // Auto festival mode is only accessible by Admin
    if (mode === "auto-festival" && isAdmin) {
      const festivalTheme = getActiveFestivalTheme();
      if (festivalTheme) return festivalTheme;
    }

    // Default or auto-time fallback for regular users / non-festival times
    return getTimeOfDayTheme(currentHour);
  }, [mode, manualThemeId, currentHour, isAdmin]);

  const activeTheme = resolveTheme();

  // Persist mode changes with admin check
  const setThemeMode = (newMode) => {
    if (newMode === "auto-festival" && !isAdmin) {
      toast.error("🔒 Auto Festival Mode is accessible by Admin accounts only.");
      return;
    }
    setMode(newMode);
    localStorage.setItem("finsage_theme_mode", newMode);
  };

  // Persist manual theme selection with admin check for festival themes
  const selectManualTheme = (themeId) => {
    const targetTheme = THEMES.find((t) => t.id === themeId);
    if (targetTheme?.category === THEME_CATEGORIES.FESTIVAL && !isAdmin) {
      toast.error(`🔒 '${targetTheme.name}' is a Festival Theme reserved for Admin accounts.`);
      return;
    }

    setManualThemeId(themeId);
    setMode("manual");
    localStorage.setItem("finsage_theme_mode", "manual");
    localStorage.setItem("finsage_theme_id", themeId);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode: mode === "auto-festival" && !isAdmin ? "auto-time" : mode,
        theme: activeTheme,
        manualThemeId,
        activeFestival,
        setThemeMode,
        selectManualTheme,
        allThemes: THEMES,
        getTimeOfDayTheme,
        getActiveFestivalTheme,
        isAdmin
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
