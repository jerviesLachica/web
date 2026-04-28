import { formatDateTime, formatDurationSince, formatDurationUntil, toDate } from "@/utils/date"

describe("date utilities", () => {
  it("returns null for invalid date strings", () => {
    expect(toDate("millis:12345")).toBeNull()
  })

  it("gracefully formats invalid date strings", () => {
    expect(formatDateTime("millis:12345")).toBe("Not available")
    expect(formatDurationSince("millis:12345")).toBe("0m")
    expect(formatDurationUntil("millis:12345")).toBe("0m")
  })
})