import { create } from "zustand"

import type { AppTheme } from "@/types/models"

const THEME_STORAGE_KEY = "sunsaver-theme"

/**
 * Applies the active color mode to the root document so Tailwind dark variants work.
 */
function applyTheme(theme: AppTheme): void {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
}

/**
 * Reads the user's persisted theme choice so the app can restore it before auth loads.
 */
function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return storedTheme === "dark" ? "dark" : "light"
}

/**
 * Persists the selected theme for future sessions.
 */
function persistTheme(theme: AppTheme): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

interface UiState {
  isOnline: boolean
  theme: AppTheme
  initializeConnectivity: () => () => void
  initializeTheme: () => void
  setTheme: (theme: AppTheme) => void
}

export const useUiStore = create<UiState>((set) => ({
  isOnline: typeof navigator === "undefined" ? true : navigator.onLine,
  theme: readStoredTheme(),
  initializeConnectivity: () => {
    if (typeof window === "undefined") {
      return () => {}
    }

    const sync = () => {
      set({ isOnline: window.navigator.onLine })
    }

    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    sync()

    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  },
  initializeTheme: () => {
    const theme = readStoredTheme()
    applyTheme(theme)
    set({ theme })
  },
  setTheme: (theme) => {
    persistTheme(theme)
    applyTheme(theme)
    set({ theme })
  },
}))

export function useIsOnline() {
  return useUiStore((state) => state.isOnline)
}
