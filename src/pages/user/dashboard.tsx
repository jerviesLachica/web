import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Battery, BatteryCharging, Clock, QrCode } from "lucide-react"

import { useCurrentUser } from "@/stores/auth-store"
import { subscribeMyRentals } from "@/services/firebase/data-service"
import { subscribePowerbanks } from "@/services/firebase/data-service"
import type { Rental, Powerbank } from "@/types/models"
import { isRentalOverdue } from "@/utils/rental"
import { formatDateTime, formatDurationSince } from "@/utils/date"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardPage() {
  const user = useCurrentUser()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])

  useEffect(() => {
    if (!user) return

    const unsubRentals = subscribeMyRentals(user.id, setRentals)
    const unsubPowerbanks = subscribePowerbanks(setPowerbanks)

    return () => {
      unsubRentals()
      unsubPowerbanks()
    }
  }, [user])

  const activeRental = rentals.find((r) => r.status === "active")
  const availableCount = powerbanks.filter((p) => p.status === "available").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Manage your powerbank rentals</p>
      </div>

      {activeRental && (
        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Active Rental</CardTitle>
            <Badge variant={isRentalOverdue(activeRental) ? "destructive" : "default"}>
              {isRentalOverdue(activeRental) ? "Overdue" : "Active"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Powerbank</p>
                  <p className="font-medium">{activeRental.powerbankId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due At</p>
                  <p className="font-medium">{formatDateTime(activeRental.dueAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Rented</p>
                  <p className="font-medium">{formatDurationSince(activeRental.startedAt)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button asChild>
                <Link to="/app/scan">Return Powerbank</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Powerbanks</CardTitle>
            <BatteryCharging className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Ready to rent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rentals.length}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeRental ? 1 : 0}</p>
            <p className="text-xs text-muted-foreground">Current rental</p>
          </CardContent>
        </Card>
      </div>

      {!activeRental && (
        <div className="flex justify-center py-8">
          <Button asChild size="lg">
            <Link to="/app/scan">Scan QR to Rent</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
