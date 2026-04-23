import { format, formatDistanceToNowStrict, isPast } from "date-fns"

export function toDate(value?: string | Date | null) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  return new Date(value)
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
