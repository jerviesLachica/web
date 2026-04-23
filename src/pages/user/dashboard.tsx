import { Link } from "react-router-dom"
import { Battery, BatteryCharging, Clock, QrCode } from "lucide-react"

import { useCurrentUser } from "@/stores/auth-store"
import { useInventoryStore } from "@/stores/inventory-store"
import { useRentalStore } from "@/stores/rental-store"
import { isRentalOverdue } from "@/utils/rental"
import { formatDateTime, formatDurationSince, formatDurationUntil } from "@/utils/date"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DashboardPage() {
  const user = useCurrentUser()
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const rentals = useRentalStore((state) => state.myRentals)

  const activeRental = rentals.find((r) => r.status === "active")
  const availableCount = powerbanks.filter((p) => p.status === "available").length
  const activePowerbank = activeRental
    ? powerbanks.find((item) => item.id === activeRental.powerbankId)
    : null

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-white/55">Manage your powerbank rentals</p>
      </div>

      {activeRental && (
        <Card className="border-white/15 bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
            <CardTitle className="text-lg">Active Rental</CardTitle>
            <Badge variant={isRentalOverdue(activeRental) ? "destructive" : "default"}>
              {isRentalOverdue(activeRental) ? "Overdue" : "Active"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm text-white/42">Powerbank</p>
                  <p className="font-medium">
                    {activePowerbank?.label ?? activeRental.powerbankId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm text-white/42">Due At</p>
                  <p className="font-medium">{formatDateTime(activeRental.dueAt)}</p>
                  <p className="text-xs text-white/48">
                    {formatDurationUntil(activeRental.dueAt)} remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm text-white/42">Rented</p>
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
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Powerbanks</CardTitle>
            <BatteryCharging className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{availableCount}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Ready to rent</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Clock className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{rentals.length}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">All time</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Battery className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{activeRental ? 1 : 0}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Current rental</p>
          </CardContent>
        </Card>
      </div>

      {!activeRental && (
        <div className="flex justify-center py-8">
          <Button asChild size="lg" className="min-w-48">
            <Link to="/app/scan">Rent a Powerbank</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
