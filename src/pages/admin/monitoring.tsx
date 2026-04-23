import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"

import { subscribeAuditLogs } from "@/services/firebase/data-service"
import { useInventoryStore } from "@/stores/inventory-store"
import { useTelemetryStore } from "@/stores/telemetry-store"
import type { AuditLog } from "@/types/models"
import { formatDateTime } from "@/utils/date"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ActivityIcon, Battery, Wifi } from "lucide-react"

function formatSeconds(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = safeSeconds % 60
  return `${minutes}m ${String(remainder).padStart(2, "0")}s`
}

export function MonitoringPage() {
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const telemetry = useTelemetryStore((state) => state.items)
  const subscribeTelemetryData = useTelemetryStore((state) => state.subscribe)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    const unsubTelemetry = subscribeTelemetryData()
    const unsubAuditLogs = subscribeAuditLogs(setAuditLogs)

    return () => {
      unsubTelemetry()
      unsubAuditLogs()
    }
  }, [subscribeTelemetryData])

  const filteredTelemetry = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return telemetry.filter((item) => {
      const powerbank = powerbanks.find(
        (powerbankItem) => powerbankItem.id === item.powerbankId
      )

      return (
        !normalizedQuery ||
        item.powerbankId.toLowerCase().includes(normalizedQuery) ||
        powerbank?.label.toLowerCase().includes(normalizedQuery) ||
        powerbank?.location.toLowerCase().includes(normalizedQuery) ||
        item.firmwareVersion.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [deferredQuery, powerbanks, telemetry])

  const recentLogs = auditLogs.slice(0, 6)

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Monitoring</h1>
        <p className="text-white/55">Real-time powerbank telemetry</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredTelemetry.filter((item) => item.online).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <ActivityIcon className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredTelemetry.filter((item) => !item.online).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.04]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charging Now</CardTitle>
            <Battery className="h-4 w-4 text-white/42" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {filteredTelemetry.filter((item) => item.chargeSessionActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Device Telemetry</CardTitle>
          <CardDescription>Real-time status from connected devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by device, label, location, or firmware"
              value={query}
              onChange={(event) => {
                const value = event.target.value
                startTransition(() => setQuery(value))
              }}
            />
          </div>
          {filteredTelemetry.length === 0 ? (
            <p className="py-8 text-center text-white/50">
              {telemetry.length === 0
                ? "No telemetry data available. Make sure devices are connected."
                : "No telemetry matches the current filters."}
            </p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Timer</TableHead>
                  <TableHead>Last Scan</TableHead>
                  <TableHead>Last Event</TableHead>
                  <TableHead>Command Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTelemetry.map((item) => {
                  const powerbank = powerbanks.find(
                    (powerbankItem) => powerbankItem.id === item.powerbankId
                  )

                  return (
                    <TableRow key={item.powerbankId}>
                      <TableCell className="font-medium">
                        {powerbank?.label ?? item.powerbankId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.online ? "default" : "destructive"}>
                          {item.online ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.batteryLevel}%</TableCell>
                       <TableCell className="font-mono text-sm">
                         {item.firmwareVersion}
                       </TableCell>
                       <TableCell>{formatDateTime(item.lastSeenAt)}</TableCell>
                       <TableCell>
                         <Badge variant={item.relayActive ? "default" : "secondary"}>
                           {item.currentMode}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         {item.chargeSessionActive
                           ? formatSeconds(item.chargeRemainingSeconds)
                           : item.cooldownActive
                             ? `Cooldown ${formatSeconds(item.cooldownRemainingSeconds)}`
                             : "-"}
                       </TableCell>
                       <TableCell>
                         {item.lastScan ? (
                           <div className="space-y-1">
                            <p className="font-medium">{item.lastScan.name || item.lastScan.code}</p>
                            <p className="font-mono text-xs text-white/48">{item.lastScan.code}</p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
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
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
          <CardDescription>Latest rent, return, and admin actions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="py-4 text-center text-white/50">
              No audit activity has been recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-white/48">
                      {log.actorType} - {log.targetType} - {log.targetId}
                    </p>
                  </div>
                  <span className="text-xs text-white/42">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
