import { resolveCodeAction } from "@/utils/code"

const basePowerbank = {
  id: "pb-001",
  label: "Library Pack 01",
  location: "Library Desk",
  status: "available" as const,
  currentRentalId: null,
  cooldownEndsAt: null,
  deviceAuthUid: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deviceControl: {
    desiredAction: "idle" as const,
    commandVersion: 0,
    updatedAt: new Date().toISOString(),
    source: "system" as const,
    tagCode: null,
    tagName: null,
  },
}

const powerbanks = [basePowerbank]

const tags = [
  {
    id: "tag-001",
    code: "RFID-001",
    name: "Library Tag",
    notes: "",
    powerbankId: "pb-001",
    status: "active" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe("code resolution", () => {
  it("returns rent for an available code", () => {
    const result = resolveCodeAction("RFID-001", powerbanks, tags, [])
    expect(result.action).toBe("rent")

    if (result.action === "rent") {
      expect(result.normalizedCode).toBe("RFID-001")
      expect(result.matchedTag?.name).toBe("Library Tag")
    }
  })

  it("returns return for the current user's active rental", () => {
    const rentals = [
      {
        id: "rental-001",
        userId: "user-001",
        powerbankId: "pb-001",
        startedAt: new Date().toISOString(),
        dueAt: new Date().toISOString(),
        returnedAt: null,
        status: "active" as const,
        notes: "",
      },
    ]

    const result = resolveCodeAction("RFID-001", powerbanks, tags, rentals)
    expect(result.action).toBe("return")
  })

  it("returns busy when the powerbank is already in use by someone else", () => {
    const busyPowerbanks = [
      {
        ...basePowerbank,
        status: "rented" as const,
        currentRentalId: "rental-other",
      },
    ]

    const result = resolveCodeAction("RFID-001", busyPowerbanks, tags, [])
    expect(result.action).toBe("busy")

    if (result.action === "busy") {
      expect(result.reason).toMatch(/already in use/i)
    }
  })

  it("returns busy when the powerbank is cooling down", () => {
    const cooldownPowerbanks = [
      {
        ...basePowerbank,
        status: "cooldown" as const,
        cooldownEndsAt: new Date(Date.now() + 60_000).toISOString(),
      },
    ]

    const result = resolveCodeAction("RFID-001", cooldownPowerbanks, tags, [])
    expect(result.action).toBe("busy")

    if (result.action === "busy") {
      expect(result.reason).toMatch(/cooling down/i)
    }
  })

  it("returns rent for a powerbank id", () => {
    const result = resolveCodeAction("pb-001", powerbanks, tags, [])
    expect(result.action).toBe("rent")
  })

  it("matches managed SUNSAVER tags after normalization", () => {
    const managedTags = [
      {
        ...tags[0],
        code: "SUNSAVER:TAG:ABC123",
      },
    ]

    const result = resolveCodeAction(" sunsaver:tag:abc123 ", powerbanks, managedTags, [])
    expect(result.action).toBe("rent")

    if (result.action === "rent") {
      expect(result.normalizedCode).toBe("SUNSAVER:TAG:ABC123")
      expect(result.matchedTag?.name).toBe("Library Tag")
    }
  })

  it("returns invalid for an unknown code", () => {
    const result = resolveCodeAction("UNKNOWN", powerbanks, tags, [])
    expect(result.action).toBe("invalid")
  })
})
