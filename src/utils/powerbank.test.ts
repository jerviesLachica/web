import {
  getEffectivePowerbankStatus,
  getPowerbankStatusLabel,
  isDeviceOnline,
  isPowerbankAvailable,
  isTelemetryOnline,
} from "@/utils/powerbank"

describe("powerbank utilities", () => {
  it("treats a powerbank with an active rental id as in use", () => {
    expect(
      getEffectivePowerbankStatus({
        status: "available",
        currentRentalId: "rental-001",
        cooldownEndsAt: null,
      })
    ).toBe("rented")
  })

  it("prefers device inventory status in_use over stale firestore availability", () => {
    expect(
      getEffectivePowerbankStatus({
        status: "available",
        currentRentalId: null,
        cooldownEndsAt: null,
        deviceState: {
          inventoryStatus: "in_use",
        },
      })
    ).toBe("rented")
  })

  it("prefers device inventory status offline when reported by firmware", () => {
    expect(
      getEffectivePowerbankStatus({
        status: "available",
        currentRentalId: null,
        cooldownEndsAt: null,
        deviceState: {
          inventoryStatus: "offline",
        },
      })
    ).toBe("offline")
  })

  it("treats a future cooldown timestamp as cooldown even if stored status says available", () => {
    const cooldownEndsAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    expect(
      getEffectivePowerbankStatus({
        status: "available",
        currentRentalId: null,
        cooldownEndsAt,
      })
    ).toBe("cooldown")
  })

  it("treats deviceState inventory cooldown as cooldown", () => {
    expect(
      getEffectivePowerbankStatus({
        status: "available",
        currentRentalId: null,
        cooldownEndsAt: null,
        deviceState: {
          inventoryStatus: "cooldown",
        },
      })
    ).toBe("cooldown")
  })

  it("treats an expired cooldown as available", () => {
    const cooldownEndsAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    expect(
      getEffectivePowerbankStatus({
        status: "cooldown",
        currentRentalId: null,
        cooldownEndsAt,
      })
    ).toBe("available")

    expect(
      isPowerbankAvailable({
        status: "cooldown",
        currentRentalId: null,
        cooldownEndsAt,
      })
    ).toBe(true)
  })

  it("maps rented to the in-use label", () => {
    expect(getPowerbankStatusLabel("rented")).toBe("In Use")
  })

  describe("telemetry online detection", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-04-25T00:00:00.000Z"))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("treats recent telemetry with online=true as online", () => {
      expect(
        isTelemetryOnline({
          online: true,
          lastSeenAt: new Date(Date.now() - 5_000).toISOString(),
        })
      ).toBe(true)
    })

    it("treats stale telemetry as offline even if the device last reported online", () => {
      expect(
        isTelemetryOnline({
          online: true,
          lastSeenAt: new Date(Date.now() - 31_000).toISOString(),
        })
      ).toBe(false)
    })

    it("falls back to the device's reported online flag when the timestamp is invalid", () => {
      expect(
        isTelemetryOnline({
          online: true,
          lastSeenAt: "millis:12345",
        })
      ).toBe(true)

      expect(
        isTelemetryOnline({
          online: false,
          lastSeenAt: "millis:12345",
        })
      ).toBe(false)
    })

    it("keeps raw timestamp-only checks offline when the timestamp is invalid", () => {
      expect(isDeviceOnline("millis:12345")).toBe(false)
    })
  })
})
