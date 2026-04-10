import { isAfter } from "date-fns"

import type { Rental, SystemSettings } from "@/types/models"
import { DEFAULT_SYSTEM_SETTINGS } from "@/constants/app"

export function isRentalOverdue(
  rental: Pick<Rental, "status" | "dueAt">,
  settings: SystemSettings = DEFAULT_SYSTEM_SETTINGS
) {
  if (rental.status !== "active") {
    return false
  }

  const dueAt = new Date(rental.dueAt)
  const withGrace = new Date(
    dueAt.getTime() + settings.overdueGraceMinutes * 60 * 1000
  )

  return isAfter(new Date(), withGrace)
}

export function getRentalStatusLabel(
  rental: Pick<Rental, "status" | "dueAt">,
  settings?: SystemSettings
) {
  if (rental.status === "returned") {
    return "Returned"
  }

  return isRentalOverdue(rental, settings) ? "Overdue" : "Active"
}
