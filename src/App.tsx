import { RouterProvider } from "react-router-dom"
import { useEffect } from "react"

import { router } from "./router"
import { useAuthStore } from "./stores/auth-store"
import { isFirebaseConfigured } from "./services/firebase/config"

function AppContent() {
  const subscribe = useAuthStore((state) => state.subscribe)

  useEffect(() => {
    const unsubscribe = subscribe()
    return () => {
      unsubscribe()
    }
  }, [subscribe])

  return <RouterProvider router={router} />
}

function App() {
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
          <p className="text-muted-foreground">
            Firebase is not configured. Please add your Firebase environment variables.
          </p>
        </div>
      </div>
    )
  }

  return <AppContent />
}

export default App
