export type UserRole = "user" | "admin"
export type UserStatus = "active" | "disabled"
export type AppTheme = "dark" | "light"

export type PowerbankStatus =
  | "available"
  | "rented"
  | "maintenance"
  | "offline"

export type DeviceAction = "idle" | "unlock" | "lock" | "resync"
export type RentalStatus = "active" | "returned"
export type AuditActorType = "user" | "admin" | "device" | "system"
export type AuditTargetType = "user" | "powerbank" | "rental" | "settings"

export interface UserProfileDetails {
  phone: string
  department: string
  studentId: string
}

export interface UserPreferences {
  theme: AppTheme
  rentalReminders: boolean
}

export interface AppUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  activeRentalId: string | null
  createdAt: string
  updatedAt: string
  profile: UserProfileDetails
  preferences: UserPreferences
}

export interface DeviceControl {
  desiredAction: DeviceAction
  commandVersion: number
  updatedAt: string
}

export interface Powerbank {
  id: string
  label: string
  qrCode: string
  rfidTagId: string
  location: string
  status: PowerbankStatus
  currentRentalId: string | null
  deviceAuthUid: string | null
  createdAt: string
  updatedAt: string
  deviceControl: DeviceControl
}

export interface Rental {
  id: string
  userId: string
  powerbankId: string
  startedAt: string
  dueAt: string
  returnedAt: string | null
  status: RentalStatus
  notes: string
}

export interface AuditLog {
  id: string
  actorType: AuditActorType
  actorId: string
  action: string
  targetType: AuditTargetType
  targetId: string
  metadata: Record<string, string | number | boolean | null>
  createdAt: string
}

export interface SystemSettings {
  defaultRentalHours: number
  overdueGraceMinutes: number
  maintenanceMode: boolean
}

export interface TelemetryEvent {
  type: string
  result: string
  timestamp: string
}

export interface PowerbankTelemetry {
  powerbankId: string
  online: boolean
  batteryLevel: number
  lastSeenAt: string
  firmwareVersion: string
  lastAppliedCommandVersion: number
  lastEvent: TelemetryEvent | null
}

export interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}
