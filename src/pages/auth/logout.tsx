import { useEffect } from "react"
import { toast } from "sonner"

import { signOutCurrentUser } from "@/services/firebase/auth-service"

export function LogoutPage() {
  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOutCurrentUser()
        toast.success("Signed out")
      } catch {
        toast.error("Failed to sign out")
      }

      window.location.replace("/auth/login?r=" + Date.now())
    }

    const timer = setTimeout(doLogout, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  )
}
