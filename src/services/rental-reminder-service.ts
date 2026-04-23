import { differenceInMilliseconds } from "date-fns"

import { APP_NAME } from "@/constants/app"
import { DEFAULT_SYSTEM_SETTINGS } from "@/constants/app"
import { getRentalStatusLabel, isRentalOverdue } from "@/utils/rental"
import type { Rental, SystemSettings, UserPreferences } from "@/types/models"

const REMINDER_LEAD_TIME_MS = 30 * 60 * 1000

let activeReminderTimer: number | null = null
let remindedRentalId: string | null = null

/**
 * Clears any pending browser notification timer so reminders do not stack.
 */
function clearReminderTimer(): void {
  if (activeReminderTimer === null || typeof window === "undefined") {
    return
  }

  window.clearTimeout(activeReminderTimer)
  activeReminderTimer = null
}

/**
 * Locates the current rental that is still in progress.
 */
function getActiveRental(rentals: Rental[]): Rental | null {
  return rentals.find((rental) => rental.status === "active") ?? null
}

/**
 * Checks whether browser notifications can be used without throwing in unsupported environments.
 */
function canUseNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

/**
 * Requests notification permission only when the user explicitly enabled reminders.
 */
export async function ensureReminderPermission(
  enabled: boolean
): Promise<NotificationPermission | "unsupported"> {
  if (!enabled) {
    return "default"
  }

  if (!canUseNotifications()) {
    return "unsupported"
  }

  if (Notification.permission === "granted") {
    return Notification.permission
  }

  try {
    return await Notification.requestPermission()
  } catch (error) {
    console.error("Failed to request notification permission", error)
    return Notification.permission
  }
}

/**
 * Schedules a single reminder shortly before the active rental reaches its due time.
 */
export function syncRentalReminder(options: {
  rentals: Rental[]
  preferences: UserPreferences | null | undefined
  settings?: SystemSettings
}): void {
  clearReminderTimer()

  const settings = options.settings ?? DEFAULT_SYSTEM_SETTINGS
  const activeRental = getActiveRental(options.rentals)

  if (!activeRental) {
    remindedRentalId = null
    return
  }

  if (!options.preferences?.rentalReminders || !canUseNotifications()) {
    remindedRentalId = null
    return
  }

  if (Notification.permission !== "granted") {
    remindedRentalId = null
    return
  }

  if (isRentalOverdue(activeRental, settings)) {
    if (remindedRentalId === activeRental.id) {
      return
    }

    new Notification(APP_NAME, {
      body: `Your rental is ${getRentalStatusLabel(activeRental, settings).toLowerCase()}. Return it as soon as possible.`,
      tag: `rental-reminder-${activeRental.id}`,
    })
    remindedRentalId = activeRental.id
    return
  }

  const dueAt = new Date(activeRental.dueAt)
  const reminderAt = new Date(dueAt.getTime() - REMINDER_LEAD_TIME_MS)
  const delay = differenceInMilliseconds(reminderAt, new Date())

  if (delay <= 0) {
    if (remindedRentalId === activeRental.id) {
      return
    }

    new Notification(APP_NAME, {
      body: "Your rental is due within 30 minutes. Return your powerbank soon.",
      tag: `rental-reminder-${activeRental.id}`,
    })
    remindedRentalId = activeRental.id
    return
  }

  activeReminderTimer = window.setTimeout(() => {
    if (Notification.permission !== "granted") {
      return
    }

    new Notification(APP_NAME, {
      body: "Your rental is due within 30 minutes. Return your powerbank soon.",
      tag: `rental-reminder-${activeRental.id}`,
    })
    remindedRentalId = activeRental.id
    activeReminderTimer = null
  }, delay)
}

/**
 * Stops reminder scheduling when the app unmounts or a user signs out.
 */
export function clearRentalReminder(): void {
  clearReminderTimer()
  remindedRentalId = null
}
