import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  useCurrentUser,
  useIsAdmin,
  useIsAuthenticated,
  useIsVerified,
} from "@/stores/auth-store"
import { adminNavigation } from "@/constants/navigation"
import { Button } from "@/components/ui/button"
import { UserIcon, MenuIcon, LogOutIcon, HomeIcon } from "lucide-react"

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const isAdmin = useIsAdmin()
  const isVerified = useIsVerified()
  const user = useCurrentUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true })
      return
    }

    if (!isVerified) {
      navigate("/auth/verify-email", { replace: true })
      return
    }

    if (!isAdmin) {
      navigate("/app", { replace: true })
    }
  }, [isAuthenticated, isAdmin, isVerified, navigate])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  if (!isAuthenticated || !isAdmin || !isVerified || !user) {
    return null
  }

  const navItems = adminNavigation

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              <MenuIcon className="w-5 h-5" />
            </Button>
            <span className="text-lg font-semibold tracking-tight">Admin</span>
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
          <nav className="border-t border-white/10 px-2 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
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

      <header className="hidden md:flex border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-18 px-4">
          <div className="flex items-center gap-6">
            <span className="text-xl font-semibold tracking-tight">Sunsaver Admin</span>
            <nav className="flex items-center gap-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon
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
            <span className="text-sm text-white/55">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app")}>
              <UserIcon className="w-4 h-4 mr-2" />
              User App
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 md:py-8 px-3 md:px-4 pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/35 backdrop-blur-xl md:hidden">
        <div className="grid h-16 grid-cols-7 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={[
                  "flex h-full flex-col py-1",
                  isActive ? "text-white" : "text-white/65",
                ].join(" ")}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px]">{item.label}</span>
              </Button>
            )
          })}
          <Button
            variant="ghost"
            className="flex h-full flex-col py-1 text-white/65"
            onClick={() => navigate("/app/profile")}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[11px]">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
