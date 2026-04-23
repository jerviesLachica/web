import { resolveCodeAction } from "@/utils/code"

const powerbanks = [
  {
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
    },
  },
]

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
  })

  it("returns rent for a powerbank id", () => {
    const result = resolveCodeAction("pb-001", powerbanks, tags, [])
    expect(result.action).toBe("rent")
  })

  it("returns invalid for an unknown code", () => {
    const result = resolveCodeAction("UNKNOWN", powerbanks, tags, [])
    expect(result.action).toBe("invalid")
  })
})
