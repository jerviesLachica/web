import { useEffect, useState } from "react"

import { subscribeTelemetry } from "@/services/firebase/telemetry-service"
import type { PowerbankTelemetry } from "@/types/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ActivityIcon, Battery, Wifi } from "lucide-react"

export function MonitoringPage() {
  const [telemetry, setTelemetry] = useState<PowerbankTelemetry[]>([])

  useEffect(() => {
    const unsub = subscribeTelemetry(setTelemetry)
    return () => unsub()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoring</h1>
        <p className="text-muted-foreground">Real-time powerbank telemetry</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {telemetry.filter((t) => t.online).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {telemetry.filter((t) => !t.online).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {telemetry.length > 0
                ? Math.round(
                    telemetry.reduce((acc, t) => acc + t.batteryLevel, 0) /
                      telemetry.length
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Telemetry</CardTitle>
          <CardDescription>
            Real-time status from connected devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {telemetry.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No telemetry data available. Make sure devices are connected.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Last Event</TableHead>
                  <TableHead>Command Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {telemetry.map((item) => (
                  <TableRow key={item.powerbankId}>
                    <TableCell className="font-medium">{item.powerbankId}</TableCell>
                    <TableCell>
                      <Badge variant={item.online ? "default" : "destructive"}>
                        {item.online ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.batteryLevel}%</TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.firmwareVersion}
                    </TableCell>
                    <TableCell>{item.lastSeenAt}</TableCell>
                    <TableCell>
                      {item.lastEvent ? (
                        <Badge variant="secondary">
                          {item.lastEvent.type}: {item.lastEvent.result}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{item.lastAppliedCommandVersion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
