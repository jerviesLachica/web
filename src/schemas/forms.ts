import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z
      .string()
      .min(8, "Confirmation password must be at least 8 characters."),
    phone: z.string().optional(),
    department: z.string().optional(),
    studentId: z.string().optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().max(20, "Phone number is too long."),
  department: z.string().max(80, "Department is too long."),
  studentId: z.string().max(40, "Student ID is too long."),
})

export const preferencesSchema = z.object({
  theme: z.enum(["dark", "light"]),
  rentalReminders: z.boolean(),
})

export const scanSchema = z.object({
  code: z.string().min(1, "Enter or scan a powerbank QR code."),
})

export const powerbankSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters."),
  qrCode: z.string().min(2, "QR code is required."),
  rfidTagId: z.string().min(2, "RFID tag is required."),
  location: z.string().max(80, "Location is too long."),
  deviceAuthUid: z.string().optional(),
  status: z.enum(["available", "rented", "maintenance", "offline"]),
})

export const userStatusSchema = z.object({
  status: z.enum(["active", "disabled"]),
})

export const systemSettingsSchema = z.object({
  defaultRentalHours: z.coerce
    .number()
    .min(1, "Rental hours must be at least 1.")
    .max(72, "Rental hours must be 72 or less."),
  overdueGraceMinutes: z.coerce
    .number()
    .min(0, "Grace minutes cannot be negative.")
    .max(240, "Grace minutes must be 240 or less."),
  maintenanceMode: z.boolean(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type PreferencesValues = z.infer<typeof preferencesSchema>
export type ScanValues = z.infer<typeof scanSchema>
export type PowerbankValues = z.infer<typeof powerbankSchema>
export type UserStatusValues = z.infer<typeof userStatusSchema>
export type SystemSettingsValues = z.infer<typeof systemSettingsSchema>
