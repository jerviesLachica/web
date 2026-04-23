import { loginSchema, powerbankSchema, registerSchema } from "@/schemas/forms"

describe("form schemas", () => {
  it("rejects mismatched registration passwords", () => {
    const result = registerSchema.safeParse({
      name: "Student One",
      email: "student@example.com",
      password: "password123",
      confirmPassword: "password456",
    })

    expect(result.success).toBe(false)
  })

  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "student@example.com",
      password: "password123",
    })

    expect(result.success).toBe(true)
  })

  it("accepts valid powerbank values", () => {
    const result = powerbankSchema.safeParse({
      label: "Station Pack 01",
      location: "Main Desk",
      deviceAuthUid: "device-uid-001",
      status: "available",
    })

    expect(result.success).toBe(true)
  })
})
