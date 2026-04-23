import { createBrowserRouter, redirect } from "react-router-dom"

import { isFirebaseConfigured } from "@/services/firebase/config"
import { DEFAULT_ROUTE } from "@/constants/app"
import { AuthLayout } from "@/routes/auth-routes"
import { UserLayout } from "@/routes/user-routes"
import { AdminLayout } from "@/routes/admin-routes"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { ForgotPasswordPage } from "@/pages/auth/forgot-password"
import { LogoutPage } from "@/pages/auth/logout"
import { VerifyEmailPage } from "@/pages/auth/verify-email"
import { DashboardPage } from "@/pages/user/dashboard"
import { ScanPage } from "@/pages/user/scan"
import { HistoryPage } from "@/pages/user/history"
import { ProfilePage } from "@/pages/user/profile"
import { TutorialPage } from "@/pages/user/tutorial"
import { OverviewPage } from "@/pages/admin/overview"
import { FlowchartPage } from "@/pages/admin/flowchart"
import { InventoryPage } from "@/pages/admin/inventory"
import { UsersPage } from "@/pages/admin/users"
import { MonitoringPage } from "@/pages/admin/monitoring"
import { TagsPage } from "@/pages/admin/tags"
import { SetupPage } from "@/pages/setup"

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect(isFirebaseConfigured ? DEFAULT_ROUTE : "/setup"),
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "logout", element: <LogoutPage /> },
    ],
  },
  {
    path: "/app",
    element: <UserLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "tutorial", element: <TutorialPage /> },
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
      { path: "flowchart", element: <FlowchartPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "tags", element: <TagsPage /> },
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
    loader: () => redirect(isFirebaseConfigured ? DEFAULT_ROUTE : "/setup"),
  },
])
