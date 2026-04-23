import type { Powerbank, Rental, RfidTag } from "@/types/models"
import { normalizeRfidTagCode } from "@/utils/nfc"

export type CodeResolution =
  | {
      action: "rent"
      powerbank: Powerbank
    }
  | {
      action: "return"
      powerbank: Powerbank
      rental: Rental
    }
  | {
      action: "invalid"
      reason: string
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
      powerbank,
      rental: activeRental,
    }
  }

  return {
    action: "rent",
    powerbank,
  }
}
