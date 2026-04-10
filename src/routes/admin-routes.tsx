import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useIsAuthenticated, useIsAdmin, useCurrentUser } from "@/stores/auth-store"
import { adminNavigation } from "@/constants/navigation"
import { Button } from "@/components/ui/button"
import { UserIcon, ShieldCheckIcon, BoxesIcon, UsersIcon, ActivityIcon, MenuIcon, LogOutIcon, HomeIcon } from "lucide-react"
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
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const isAdmin = useIsAdmin()
  const user = useCurrentUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/app", { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  if (!isAuthenticated || !isAdmin || !user) {
    return null
  }

  const navItems = [
    { path: "/admin", label: "Overview", icon: ShieldCheckIcon },
    ...adminNavigation,
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <MenuIcon className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <HomeIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/auth/logout")}>
              <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t px-2 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon.name] || ShieldCheckIcon
              const isActive = location.pathname === item.path
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        )}
      </header>

      <header className="hidden md:flex border-b bg-card">
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
              <UserIcon className="w-4 h-4 mr-2" />
              User App
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 md:py-6 px-2 md:px-4 pb-20 md:pb-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-card md:hidden z-50">
        <div className="flex items-center justify-around h-14">
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/admin")}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="text-xs">Overview</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/admin/inventory")}
          >
            <BoxesIcon className="w-5 h-5" />
            <span className="text-xs">Inventory</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/admin/users")}
          >
            <UsersIcon className="w-5 h-5" />
            <span className="text-xs">Users</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/admin/monitoring")}
          >
            <ActivityIcon className="w-5 h-5" />
            <span className="text-xs">Monitor</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/app/profile")}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}

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