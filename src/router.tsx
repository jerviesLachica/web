import { createBrowserRouter, redirect } from "react-router-dom"

import { isFirebaseConfigured } from "@/services/firebase/config"
import { DEFAULT_ROUTE, FIREBASE_SETUP_MESSAGE } from "@/constants/app"
import { AuthLayout } from "@/routes/auth-routes"
import { UserLayout } from "@/routes/user-routes"
import { AdminLayout } from "@/routes/admin-routes"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { ForgotPasswordPage } from "@/pages/auth/forgot-password"
import { DashboardPage } from "@/pages/user/dashboard"
import { GetPage } from "@/pages/user/get"
import { ScanPage } from "@/pages/user/scan"
import { HistoryPage } from "@/pages/user/history"
import { ProfilePage } from "@/pages/user/profile"
import { OverviewPage } from "@/pages/admin/overview"
import { InventoryPage } from "@/pages/admin/inventory"
import { UsersPage } from "@/pages/admin/users"
import { MonitoringPage } from "@/pages/admin/monitoring"
import { SetupPage } from "@/pages/setup"

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect(DEFAULT_ROUTE),
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "logout", element: <div>Signing out...</div> },
    ],
  },
  {
    path: "/app",
    element: <UserLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "get", element: <GetPage /> },
      { path: "scan", element: <ScanPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
    ],
  },
  {
    path: "/setup",
    element: <SetupPage />,
  },
  {
    path: "*",
    loader: () => redirect(DEFAULT_ROUTE),
  },
])

if (!isFirebaseConfigured) {
  router.navigate("/setup")
  console.warn(FIREBASE_SETUP_MESSAGE)
}
