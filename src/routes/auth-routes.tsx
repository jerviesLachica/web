import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import {
  useCurrentUser,
  useIsAuthenticated,
  useIsVerified,
} from "@/stores/auth-store"
import { AuthParticleBackground } from "@/components/auth/auth-particle-background"

export function AuthLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const isVerified = useIsVerified()
  const user = useCurrentUser()
  const isVerifyRoute = location.pathname === "/auth/verify-email"
  const isLogoutRoute = location.pathname === "/auth/logout"

  useEffect(() => {
    if (isAuthenticated) {
      if (isLogoutRoute) {
        return
      }

      if (!isVerified) {
        if (!isVerifyRoute) {
          navigate("/auth/verify-email", { replace: true })
        }
        return
      }

      navigate(user?.role === "admin" ? "/admin" : "/app", { replace: true })
    }
  }, [isAuthenticated, isLogoutRoute, isVerified, isVerifyRoute, navigate, user?.role])

  if (isAuthenticated && !isVerifyRoute && !isLogoutRoute) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-slate-950 p-4 text-slate-100">
      <AuthParticleBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.78))]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center py-6">
        <Outlet />
      </div>
    </div>
  )
}
