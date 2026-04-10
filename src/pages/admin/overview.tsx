import { useEffect, useState } from "react"

import {
  subscribePowerbanks,
  subscribeUsers,
  subscribeAllRentals,
  subscribeSystemSettings,
} from "@/services/firebase/data-service"
import type { Powerbank, AppUser, Rental, SystemSettings } from "@/types/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BoxesIcon, UsersIcon, ActivityIcon, Settings2Icon } from "lucide-react"

export function OverviewPage() {
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [settings, setSettings] = useState<SystemSettings | null>(null)

  useEffect(() => {
    const unsubPowerbanks = subscribePowerbanks(setPowerbanks)
    const unsubUsers = subscribeUsers(setUsers)
    const unsubRentals = subscribeAllRentals(setRentals)
    const unsubSettings = subscribeSystemSettings(setSettings)

    return () => {
      unsubPowerbanks()
      unsubUsers()
      unsubRentals()
      unsubSettings()
    }
  }, [])

  const availableCount = powerbanks.filter((p) => p.status === "available").length
  const rentedCount = powerbanks.filter((p) => p.status === "rented").length
  const maintenanceCount = powerbanks.filter((p) => p.status === "maintenance").length
  const activeRentals = rentals.filter((r) => r.status === "active").length
  const activeUsers = users.filter((u) => u.status === "active").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Powerbanks</CardTitle>
            <BoxesIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{powerbanks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{availableCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rented</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rentedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{maintenanceCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeRentals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Settings2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={settings?.maintenanceMode ? "destructive" : "default"}>
              {settings?.maintenanceMode ? "Maintenance" : "Operational"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
