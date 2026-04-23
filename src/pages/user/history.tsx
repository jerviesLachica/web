import { startTransition, useDeferredValue, useMemo, useState } from "react"

import { useInventoryStore } from "@/stores/inventory-store"
import { useRentalStore } from "@/stores/rental-store"
import { isRentalOverdue, getRentalStatusLabel } from "@/utils/rental"
import { formatDateTime } from "@/utils/date"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export function HistoryPage() {
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const settings = useInventoryStore((state) => state.settings)
  const rentals = useRentalStore((state) => state.myRentals)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "returned">(
    "all"
  )
  const deferredQuery = useDeferredValue(query)

  const filteredRentals = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return rentals.filter((rental) => {
      const powerbank = powerbanks.find((item) => item.id === rental.powerbankId)
      const matchesQuery =
        !normalizedQuery ||
        rental.powerbankId.toLowerCase().includes(normalizedQuery) ||
        powerbank?.label.toLowerCase().includes(normalizedQuery)

      const matchesStatus =
        statusFilter === "all" ? true : rental.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [deferredQuery, powerbanks, rentals, statusFilter])

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">History</p>
        <h1 className="text-3xl font-semibold tracking-tight">Rental History</h1>
        <p className="text-white/55">View your past and current rentals</p>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>All Rentals</CardTitle>
          <CardDescription>
            {rentals.length} total rental{rentals.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <Input
              placeholder="Search by powerbank label or ID"
              value={query}
              onChange={(event) => {
                const value = event.target.value
                startTransition(() => setQuery(value))
              }}
            />
            <select
              className="flex h-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as typeof statusFilter)
              }
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          {filteredRentals.length === 0 ? (
            <p className="py-8 text-center text-white/50">
              {rentals.length === 0
                ? "No rentals yet. Rent a powerbank to get started!"
                : "No rentals match the current filters."}
            </p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Powerbank</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => {
                  const powerbank = powerbanks.find(
                    (item) => item.id === rental.powerbankId
                  )

                  return (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">
                        {powerbank?.label ?? rental.powerbankId}
                      </TableCell>
                    <TableCell>{formatDateTime(rental.startedAt)}</TableCell>
                    <TableCell>{formatDateTime(rental.dueAt)}</TableCell>
                    <TableCell>
                      {rental.returnedAt ? formatDateTime(rental.returnedAt) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rental.status === "returned"
                            ? "secondary"
                            : isRentalOverdue(rental, settings)
                              ? "destructive"
                              : "default"
                        }
                      >
                        {getRentalStatusLabel(rental, settings)}
                      </Badge>
                    </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
