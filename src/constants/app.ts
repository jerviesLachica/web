import type {
  SystemSettings,
  UserPreferences,
  UserProfileDetails,
} from "@/types/models"

export const APP_NAME = "Sunsaver"
export const DEFAULT_ROUTE = "/app"
export const DEFAULT_ADMIN_ROUTE = "/admin"

export const FIREBASE_SETUP_MESSAGE =
  "Firebase is not configured yet. Add the Vite Firebase environment variables to connect this app to Auth, Firestore, RTDB, and Hosting."

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  defaultRentalHours: 6,
  overdueGraceMinutes: 15,
  maintenanceMode: false,
}

export const DEFAULT_USER_PROFILE: UserProfileDetails = {
  phone: "",
  department: "",
  studentId: "",
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "dark",
  rentalReminders: true,
}
