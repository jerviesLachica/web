import {
  ActivityIcon,
  BoxesIcon,
  GitBranchIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  QrCodeIcon,
  TagIcon,
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
    label: "Scan",
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
    label: "Flowchart",
    path: "/admin/flowchart",
    icon: GitBranchIcon,
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
    label: "Tags",
    path: "/admin/tags",
    icon: TagIcon,
  },
  {
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: ActivityIcon,
  },
]
