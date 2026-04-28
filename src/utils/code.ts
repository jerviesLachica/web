import type { Powerbank, Rental, RfidTag } from "@/types/models"
import { normalizeRfidTagCode } from "@/utils/nfc"
import { getEffectivePowerbankStatus } from "@/utils/powerbank"

type CodeResolutionContext = {
  normalizedCode: string
  matchedTag: RfidTag | null
}

export type CodeResolution =
  | (CodeResolutionContext & {
      action: "rent"
      powerbank: Powerbank
    })
  | (CodeResolutionContext & {
      action: "return"
      powerbank: Powerbank
      rental: Rental
    })
  | (CodeResolutionContext & {
      action: "busy"
      powerbank: Powerbank
      reason: string
    })
  | (CodeResolutionContext & {
      action: "invalid"
      reason: string
    })

function getUnavailableReason(powerbank: Powerbank) {
  const effectiveStatus = getEffectivePowerbankStatus(powerbank)

  switch (effectiveStatus) {
    case "rented":
      return "That powerbank is already in use by another user."
    case "cooldown":
      return "That powerbank is cooling down. Try again in a few minutes."
    case "maintenance":
      return "That powerbank is under maintenance right now."
    case "offline":
      return "That powerbank is offline right now."
    default:
      return "That powerbank is not available right now."
  }
}

export function resolveCodeAction(
  code: string,
  powerbanks: Powerbank[],
  tags: RfidTag[],
  rentals: Rental[]
): CodeResolution {
  const normalized = normalizeRfidTagCode(code)
  const matchedTag = tags.find(
    (item) => item.status === "active" && normalizeRfidTagCode(item.code) === normalized
  )
  const powerbank = powerbanks.find(
    (item) => item.id === (matchedTag?.powerbankId ?? normalized) || item.id === normalized
  )

  if (!powerbank) {
    return {
      action: "invalid",
      normalizedCode: normalized,
      matchedTag: matchedTag ?? null,
      reason: "No powerbank matches that code.",
    }
  }

  const activeRental = rentals.find(
    (rental) =>
      rental.powerbankId === powerbank.id && rental.status === "active"
  )

  if (activeRental) {
    return {
      action: "return",
      normalizedCode: normalized,
      matchedTag: matchedTag ?? null,
      powerbank,
      rental: activeRental,
    }
  }

  if (getEffectivePowerbankStatus(powerbank) !== "available") {
    return {
      action: "busy",
      normalizedCode: normalized,
      matchedTag: matchedTag ?? null,
      powerbank,
      reason: getUnavailableReason(powerbank),
    }
  }

  return {
    action: "rent",
    normalizedCode: normalized,
    matchedTag: matchedTag ?? null,
    powerbank,
  }
}
