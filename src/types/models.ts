export type UserRole = "user" | "admin"
export type UserStatus = "active" | "disabled"
export type AppTheme = "dark" | "light"

export type PowerbankStatus =
  | "available"
  | "in_use"
  | "rented"
  | "cooldown"
  | "maintenance"
  | "offline"

export type DeviceAction = "idle" | "unlock" | "lock" | "resync"
export type RentalStatus = "active" | "returned"
export type AuditActorType = "user" | "admin" | "device" | "system"
export type AuditTargetType = "user" | "powerbank" | "rental" | "settings"
export type TagStatus = "active" | "disabled"
export type BatteryEstimateState = "estimated" | "out_of_range" | "sensor_unavailable"
export type RfidLogSource =
  | "rfid"
  | "web_nfc"
  | "manual"
  | "firebase"
  | "command"
  | "system"
export type RfidLogEventType = "tap" | "session_start" | "session_end" | "command" | "status"

export interface DeviceControlCommandMetadata {
  source: RfidLogSource
  tagCode: string | null
  tagName: string | null
}

export interface UserProfileDetails {
  phone: string
  department: string
  studentId: string
}

export interface UserPreferences {
  theme: AppTheme
  rentalReminders: boolean
  onboardingCompleted: boolean
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

export interface DeviceControl extends DeviceControlCommandMetadata {
  desiredAction: DeviceAction
  commandVersion: number
  updatedAt: string
}

export interface Powerbank {
  id: string
  label: string
  location: string
  status: PowerbankStatus
  currentRentalId: string | null
  cooldownEndsAt: string | null
  deviceAuthUid: string | null
  createdAt: string
  updatedAt: string
  deviceControl: DeviceControl
  deviceState?: {
    mode?: string
    inventoryStatus?: PowerbankStatus | null
    batteryEstimateState?: BatteryEstimateState | null
    updatedAt?: string | null
    lastEventType?: string | null
    lastEventResult?: string | null
  }
}

export interface RfidTag {
  id: string
  code: string
  name: string
  notes: string
  powerbankId: string | null
  status: TagStatus
  createdAt: string
  updatedAt: string
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

export interface RfidTapLog {
  id: string
  powerbankId: string
  source: RfidLogSource
  eventType: RfidLogEventType
  result: string
  tagCode: string | null
  tagName: string | null
  batteryPercentBefore: number | null
  batteryPercentAfter: number | null
  batteryPercentLost: number | null
  batteryPercentRetained: number | null
  sessionStartedAt: string | null
  sessionEndedAt: string | null
  createdAt: string
}

export interface SystemSettings {
  defaultRentalHours: number
  chargeDurationMinutes: number
  cooldownMinutes: number
  overdueGraceMinutes: number
  maintenanceMode: boolean
}

export interface TelemetryEvent {
  type: string
  result: string
  timestamp: string
}

export interface TelemetryLastScan {
  code: string
  name: string
  timestamp: string
}

export interface PowerbankTelemetry {
  powerbankId: string
  online: boolean
  batteryLevel: number | null
  batteryVoltage: number | null
  batteryBusVoltage: number | null
  batteryShuntVoltageMv: number | null
  batteryRawBusVoltage: number | null
  batteryRawShuntVoltageMv: number | null
  batteryRawLoadVoltage: number | null
  batterySensorAvailable: boolean
  batteryEstimateState: BatteryEstimateState
  inventoryStatus: PowerbankStatus | null
  lastSeenAt: string
  firmwareVersion: string
  currentMode: string
  relayActive: boolean
  chargeSessionActive: boolean
  chargeRemainingSeconds: number
  cooldownActive: boolean
  cooldownRemainingSeconds: number
  lastAppliedCommandVersion: number
  lastEvent: TelemetryEvent | null
  lastScan: TelemetryLastScan | null
}

export interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}
