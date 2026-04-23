import { useEffect, useState } from "react"
import { registerSW } from "virtual:pwa-register"
import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"

import { router } from "./router"
import { useAuthStore } from "./stores/auth-store"
import { useInventoryStore } from "./stores/inventory-store"
import { useRentalStore } from "./stores/rental-store"
import { useUiStore } from "./stores/ui-store"
import { isFirebaseConfigured } from "./services/firebase/config"
import { SetupPage } from "./pages/setup"
import {
  clearRentalReminder,
  syncRentalReminder,
} from "./services/rental-reminder-service"

function AppContent() {
  const [showRefreshIntro, setShowRefreshIntro] = useState(true)
  const subscribe = useAuthStore((state) => state.subscribe)
  const authInitialized = useAuthStore((state) => state.initialized)
  const firebaseUser = useAuthStore((state) => state.firebaseUser)
  const userPreferences = useAuthStore((state) => state.user?.preferences)
  const preferredTheme = useAuthStore(
    (state) => state.user?.preferences.theme
  )
  const currentUserId = useAuthStore((state) => state.user?.id)
  const initializeConnectivity = useUiStore(
    (state) => state.initializeConnectivity
  )
  const initializeTheme = useUiStore((state) => state.initializeTheme)
  const setTheme = useUiStore((state) => state.setTheme)
  const isOnline = useUiStore((state) => state.isOnline)
  const settings = useInventoryStore((state) => state.settings)
  const subscribeInventory = useInventoryStore((state) => state.subscribe)
  const myRentals = useRentalStore((state) => state.myRentals)
  const subscribeMyRentals = useRentalStore((state) => state.subscribeMy)

  useEffect(() => {
    const unsubscribe = subscribe()
    return () => {
      unsubscribe()
    }
  }, [subscribe])

  useEffect(() => {
    const update = registerSW({
      immediate: true,
    })

    return () => {
      update(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = initializeConnectivity()
    return () => {
      unsubscribe()
    }
  }, [initializeConnectivity])

  useEffect(() => {
    if (!authInitialized || !firebaseUser) {
      return () => {}
    }

    const unsubscribe = subscribeInventory()
    return () => {
      unsubscribe()
    }
  }, [authInitialized, firebaseUser, subscribeInventory])

  useEffect(() => {
    if (!currentUserId) {
      clearRentalReminder()
      return () => {
        clearRentalReminder()
      }
    }

    const unsubscribe = subscribeMyRentals(currentUserId)
    return () => {
      unsubscribe()
      clearRentalReminder()
    }
  }, [currentUserId, subscribeMyRentals])

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  useEffect(() => {
    if (!preferredTheme) {
      return
    }

    setTheme(preferredTheme)
  }, [preferredTheme, setTheme])

  useEffect(() => {
    syncRentalReminder({
      rentals: myRentals,
      preferences: userPreferences,
      settings,
    })

    return () => {
      clearRentalReminder()
    }
  }, [myRentals, settings, userPreferences])

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setShowRefreshIntro(false)
    }, 900)

    return () => {
      window.clearTimeout(fadeTimer)
    }
  }, [])

  return (
    <>
      <div
        className={[
          "pointer-events-none fixed inset-0 z-[120] transition-all duration-700 ease-out",
          showRefreshIntro ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/94 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-18 items-center justify-center rounded-[28px] border border-[#ffd166]/20 bg-[#ffd166]/10 text-xl font-semibold tracking-[0.28em] text-[#ffd166] animate-pulse">
              S
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-white/42">Sunsaver</p>
              <p className="mt-2 text-sm text-white/58">Loading your workspace...</p>
            </div>
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="sticky top-0 z-50 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-200 backdrop-blur">
          Offline mode: cached data is available, but rent/return and admin updates are disabled.
        </div>
      )}
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  )
}

function App() {
  if (!isFirebaseConfigured) {
    return <SetupPage />
  }

  return <AppContent />
}

export default App
