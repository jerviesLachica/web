import {
  ActivityIcon,
  BoxesIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  QrCodeIcon,
  Settings2Icon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import type { NavItem } from "@/types/models"

export const userNavigation: NavItem[] = [
  {
    label: "Dashboard",
    path: "/app",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Scan QR",
    path: "/app/scan",
    icon: QrCodeIcon,
  },
  {
    label: "History",
    path: "/app/history",
    icon: HistoryIcon,
  },
  {
    label: "Profile",
    path: "/app/profile",
    icon: Settings2Icon,
  },
]

export const adminNavigation: NavItem[] = [
  {
    label: "Overview",
    path: "/admin",
    icon: ShieldCheckIcon,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: BoxesIcon,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: UsersIcon,
  },
  {
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: ActivityIcon,
  },
]
