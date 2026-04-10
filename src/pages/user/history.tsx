import { useEffect, useState } from "react"

import { useCurrentUser } from "@/stores/auth-store"
import { subscribeMyRentals } from "@/services/firebase/data-service"
import type { Rental } from "@/types/models"
import { isRentalOverdue, getRentalStatusLabel } from "@/utils/rental"
import { formatDateTime } from "@/utils/date"
import { DEFAULT_SYSTEM_SETTINGS } from "@/constants/app"
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

export function HistoryPage() {
  const user = useCurrentUser()
  const [rentals, setRentals] = useState<Rental[]>([])

  useEffect(() => {
    if (!user) return

    const unsubRentals = subscribeMyRentals(user.id, setRentals)
    return () => unsubRentals()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rental History</h1>
        <p className="text-muted-foreground">View your past and current rentals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rentals</CardTitle>
          <CardDescription>
            {rentals.length} total rental{rentals.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No rentals yet. Scan a powerbank to start!
            </p>
          ) : (
            <Table>
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
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">{rental.powerbankId}</TableCell>
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
                            : isRentalOverdue(rental, DEFAULT_SYSTEM_SETTINGS)
                              ? "destructive"
                              : "default"
                        }
                      >
                        {getRentalStatusLabel(rental, DEFAULT_SYSTEM_SETTINGS)}
                      </Badge>
                    </TableCell>
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
