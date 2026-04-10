import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useIsAuthenticated, useCurrentUser } from "@/stores/auth-store"
import { userNavigation } from "@/constants/navigation"
import { Button } from "@/components/ui/button"
import { UserIcon, QrCodeIcon, HistoryIcon, LayoutDashboardIcon, Settings2Icon } from "lucide-react"
import { DashboardPage } from "@/pages/user/dashboard"
import { ScanPage } from "@/pages/user/scan"
import { HistoryPage } from "@/pages/user/history"
import { ProfilePage } from "@/pages/user/profile"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboardIcon,
  QrCodeIcon,
  HistoryIcon,
  Settings2Icon,
}

export function UserLayout() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const user = useCurrentUser()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold">Sunsaver</span>
            <nav className="flex items-center gap-1">
              {userNavigation.map((item) => {
                const Icon = iconMap[item.icon.name] || LayoutDashboardIcon
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth/logout")}>
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

export const userRoutes = [
  {
    path: "/app",
    element: <UserLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "scan", element: <ScanPage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]
