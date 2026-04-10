import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { useIsAuthenticated, useCurrentUser, useIsAdmin } from "@/stores/auth-store"
import { userNavigation } from "@/constants/navigation"
import { Button } from "@/components/ui/button"
import { UserIcon, QrCodeIcon, HistoryIcon, LayoutDashboardIcon, Settings2Icon, ShieldCheckIcon, MenuIcon, LogOutIcon, HomeIcon } from "lucide-react"
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
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const user = useCurrentUser()
  const isAdmin = useIsAdmin()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    )
  }

  const navItems = [
    { path: "/app", label: "Home", icon: HomeIcon },
    ...userNavigation,
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <MenuIcon className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold">Sunsaver</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                <ShieldCheckIcon className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/auth/logout")}>
              <LogOutIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t px-2 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon.name] || LayoutDashboardIcon
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
            <span className="text-xl font-bold">Sunsaver</span>
            <nav className="flex items-center gap-1">
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
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
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
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
            onClick={() => navigate("/app")}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/app/scan")}
          >
            <QrCodeIcon className="w-5 h-5" />
            <span className="text-xs">Scan</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-full py-1"
            onClick={() => navigate("/app/history")}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-xs">History</span>
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