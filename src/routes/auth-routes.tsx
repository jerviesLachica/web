import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import { useIsAuthenticated } from "@/stores/auth-store"
import { DEFAULT_ROUTE } from "@/constants/app"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { ForgotPasswordPage } from "@/pages/auth/forgot-password"

export function AuthLayout() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(DEFAULT_ROUTE, { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Outlet />
    </div>
  )
}

export const authRoutes = [
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
]
