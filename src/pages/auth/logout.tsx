import { useEffect } from "react"
import { signOut } from "firebase/auth"
import { toast } from "sonner"

import { auth, requireFirebase } from "@/services/firebase/config"

export function LogoutPage() {
  useEffect(() => {
    const doLogout = async () => {
      try {
        const firebaseAuth = requireFirebase(auth, "Firebase Auth")
        await signOut(firebaseAuth)
        toast.success("Signed out")
        window.location.href = "/auth/login"
      } catch (error) {
        console.log("Logout error:", error)
        toast.error("Failed to sign out")
        window.location.href = "/auth/login"
      }
    }

    doLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing out...</p>
    </div>
  )
}