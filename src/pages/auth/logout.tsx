import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { signOutCurrentUser } from "@/services/firebase/auth-service"

export async function loader() {
  try {
    await signOutCurrentUser()
    toast.success("Signed out successfully")
  } catch {
    toast.error("Failed to sign out")
  }
  return window.location.href = "/auth/login"
}

export function Component() {
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    try {
      await signOutCurrentUser()
      toast.success("Signed out successfully")
      navigate("/auth/login")
    } catch {
      toast.error("Failed to sign out")
    }
  }

  handleLogout()
  return null
}
