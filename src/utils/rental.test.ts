import { getRentalStatusLabel, isRentalOverdue } from "@/utils/rental"

describe("rental utilities", () => {
  it("marks active rentals overdue after the grace window", () => {
    const rental = {
      status: "active" as const,
      dueAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    }

    expect(
      isRentalOverdue(rental, {
        defaultRentalHours: 6,
        chargeDurationMinutes: 30,
        cooldownMinutes: 5,
        overdueGraceMinutes: 15,
        maintenanceMode: false,
      })
    ).toBe(true)
  })

  it("returns the correct human status label", () => {
    const activeRental = {
      status: "active" as const,
      dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }

    const returnedRental = {
      status: "returned" as const,
      dueAt: new Date().toISOString(),
    }

    expect(getRentalStatusLabel(activeRental)).toBe("Active")
    expect(getRentalStatusLabel(returnedRental)).toBe("Returned")
  })
})
