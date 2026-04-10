import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useIsAuthenticated, useIsAdmin, useCurrentUser } from "@/stores/auth-store"
import { adminNavigation } from "@/constants/navigation"
import { Button } from "@/components/ui/button"
import { UserIcon, ShieldCheckIcon, BoxesIcon, UsersIcon, ActivityIcon } from "lucide-react"
import { OverviewPage } from "@/pages/admin/overview"
import { InventoryPage } from "@/pages/admin/inventory"
import { UsersPage } from "@/pages/admin/users"
import { MonitoringPage } from "@/pages/admin/monitoring"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheckIcon,
  BoxesIcon,
  UsersIcon,
  ActivityIcon,
}

export function AdminLayout() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const isAdmin = useIsAdmin()
  const user = useCurrentUser()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/app", { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  if (!isAuthenticated || !isAdmin || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold">Sunsaver Admin</span>
            <nav className="flex items-center gap-1">
              {adminNavigation.map((item) => {
                const Icon = iconMap[item.icon.name] || ShieldCheckIcon
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
              <UserIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 px-4">
        <Outlet />
      </main>
    </div>
  )
}

import { Outlet } from "react-router-dom"

export const adminRoutes = [
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
]
