import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  subscribeUsers,
} from "@/services/firebase/data-service"
import { useInventoryStore } from "@/stores/inventory-store"
import { useRentalStore } from "@/stores/rental-store"
import type { AppUser } from "@/types/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BoxesIcon, UsersIcon, ActivityIcon, Settings2Icon } from "lucide-react"

export function OverviewPage() {
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const settings = useInventoryStore((state) => state.settings)
  const rentals = useRentalStore((state) => state.allRentals)
  const subscribeRentals = useRentalStore((state) => state.subscribeAll)
  const [users, setUsers] = useState<AppUser[]>([])

  useEffect(() => {
    const unsubUsers = subscribeUsers(setUsers)
    const unsubRentals = subscribeRentals()

    return () => {
      unsubUsers()
      unsubRentals()
    }
  }, [subscribeRentals])

  const availableCount = powerbanks.filter((p) => p.status === "available").length
  const rentedCount = powerbanks.filter((p) => p.status === "rented").length
  const cooldownCount = powerbanks.filter((p) => p.status === "cooldown").length
  const maintenanceCount = powerbanks.filter((p) => p.status === "maintenance").length
  const activeRentals = rentals.filter((r) => r.status === "active").length
  const activeUsers = users.filter((u) => u.status === "active").length
  const inventoryChartData = [
    { name: "Available", value: availableCount, fill: "#3B82F6" },
    { name: "Rented", value: rentedCount, fill: "#8B5CF6" },
    { name: "Cooldown", value: cooldownCount, fill: "#14B8A6" },
    { name: "Maintenance", value: maintenanceCount, fill: "#F59E0B" },
  ]
  const activityChartData = [
    { name: "Users", total: users.length },
    { name: "Active Users", total: activeUsers },
    { name: "Rentals", total: rentals.length },
    { name: "Active Rentals", total: activeRentals },
  ]

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Overview</h1>
        <p className="text-white/55">System overview and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Powerbanks</CardTitle>
            <BoxesIcon className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{powerbanks.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{availableCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rentedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{maintenanceCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cooldown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cooldownCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeUsers}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <ActivityIcon className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeRentals}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings2Icon className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <Badge variant={settings.maintenanceMode ? "destructive" : "default"}>
              {settings.maintenanceMode ? "Maintenance" : "Operational"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card className="bg-white/[0.04]">
          <CardHeader>
            <CardTitle>Inventory Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {inventoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.04]">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
