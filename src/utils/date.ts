import { format, formatDistanceToNowStrict, isPast } from "date-fns"

function isSupportedDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(value)
}

export function toDate(value?: string | Date | null) {
  if (!value) {
    return null
  }

  if (typeof value === "string" && !isSupportedDateString(value)) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value?: string | Date | null) {
  const date = toDate(value)

  if (!date) {
    return "Not available"
  }

  return format(date, "MMM d, yyyy h:mm a")
}

export function formatDurationSince(value?: string | Date | null) {
  const date = toDate(value)

  if (!date) {
    return "0m"
  }

  return formatDistanceToNowStrict(date, { addSuffix: false })
}

export function formatDurationUntil(value?: string | Date | null) {
  const date = toDate(value)

  if (!date || isPast(date)) {
    return "0m"
  }

  return formatDistanceToNowStrict(date, { addSuffix: false })
}
