import type { Powerbank, Rental } from "@/types/models"

export type QrResolution =
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

export function resolveQrAction(
  code: string,
  powerbanks: Powerbank[],
  rentals: Rental[]
): QrResolution {
  const normalized = code.trim()
  const powerbank = powerbanks.find(
    (item) => item.qrCode === normalized || item.id === normalized
  )

  if (!powerbank) {
    return {
      action: "invalid",
      reason: "No powerbank matches that QR code.",
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
