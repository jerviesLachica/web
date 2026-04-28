import { isAfter } from "date-fns"

import type {
  BatteryEstimateState,
  Powerbank,
  PowerbankStatus,
  PowerbankTelemetry,
} from "@/types/models"
import { toDate } from "@/utils/date"

function hasExpiredCooldown(cooldownEndsAt: string | null) {
  if (!cooldownEndsAt) {
    return false
  }

  const cooldownDate = new Date(cooldownEndsAt)
  return !Number.isNaN(cooldownDate.getTime()) && isAfter(new Date(), cooldownDate)
}

function hasActiveCooldown(cooldownEndsAt: string | null) {
  if (!cooldownEndsAt) {
    return false
  }

  const cooldownDate = new Date(cooldownEndsAt)
  return !Number.isNaN(cooldownDate.getTime()) && !isAfter(new Date(), cooldownDate)
}

export function getEffectivePowerbankStatus(
  powerbank: Pick<Powerbank, "status" | "currentRentalId" | "cooldownEndsAt"> & {
    deviceState?: Pick<NonNullable<Powerbank["deviceState"]>, "inventoryStatus"> | undefined
  }
): PowerbankStatus {
  if (powerbank.deviceState?.inventoryStatus === "in_use") {
    return "rented"
  }

  if (powerbank.deviceState?.inventoryStatus === "cooldown") {
    if (hasExpiredCooldown(powerbank.cooldownEndsAt)) {
      return "available"
    }

    return "cooldown"
  }

  if (powerbank.deviceState?.inventoryStatus === "offline") {
    return "offline"
  }

  if (powerbank.currentRentalId) {
    return "rented"
  }

  if (hasActiveCooldown(powerbank.cooldownEndsAt)) {
    return "cooldown"
  }

  if (powerbank.status === "cooldown" && hasExpiredCooldown(powerbank.cooldownEndsAt)) {
    return "available"
  }

  return powerbank.status
}

export function isPowerbankAvailable(
  powerbank: Pick<Powerbank, "status" | "currentRentalId" | "cooldownEndsAt">
) {
  return getEffectivePowerbankStatus(powerbank) === "available"
}

export function getPowerbankStatusLabel(status: PowerbankStatus) {
  switch (status) {
    case "available":
      return "Available"
    case "rented":
      return "In Use"
    case "cooldown":
      return "Cooldown"
    case "maintenance":
      return "Maintenance"
    case "offline":
      return "Offline"
    default:
      return status
  }
}

const TELEMETRY_OFFLINE_THRESHOLD_MS = 30_000

function hasFreshTelemetry(lastSeenAt: string): boolean | null {
  const lastSeen = toDate(lastSeenAt)
  if (!lastSeen) {
    return null
  }

  return Date.now() - lastSeen.getTime() < TELEMETRY_OFFLINE_THRESHOLD_MS
}

export function isDeviceOnline(lastSeenAt: string): boolean {
  const isFresh = hasFreshTelemetry(lastSeenAt)
  if (isFresh === null) {
    return false
  }

  return isFresh
}

export function isTelemetryOnline(
  telemetry: Pick<PowerbankTelemetry, "lastSeenAt" | "online">
): boolean {
  const isFresh = hasFreshTelemetry(telemetry.lastSeenAt)
  if (isFresh === null) {
    return telemetry.online
  }

  return telemetry.online && isFresh
}

export function hasReliableBatteryEstimate(
  telemetry: Pick<PowerbankTelemetry, "batteryLevel" | "batteryEstimateState">
) {
  return telemetry.batteryEstimateState === "estimated" && telemetry.batteryLevel !== null
}

export function getBatteryTelemetryLabel(
  telemetry: Pick<PowerbankTelemetry, "batteryLevel" | "batteryEstimateState">
) {
  if (hasReliableBatteryEstimate(telemetry)) {
    return `${telemetry.batteryLevel}%`
  }

  switch (telemetry.batteryEstimateState) {
    case "out_of_range":
      return "Check wiring"
    case "sensor_unavailable":
      return "Sensor offline"
    default:
      return "Waiting for sample"
  }
}

export function getBatteryTelemetryDetails(
  telemetry: Pick<
    PowerbankTelemetry,
    | "batteryVoltage"
    | "batteryBusVoltage"
    | "batteryRawBusVoltage"
    | "batteryRawLoadVoltage"
    | "batterySensorAvailable"
  >
) {
  const details: string[] = []

  if (telemetry.batteryVoltage !== null) {
    details.push(`${telemetry.batteryVoltage.toFixed(2)}V measured`)
  }

  if (
    telemetry.batteryBusVoltage !== null &&
    (telemetry.batteryVoltage === null ||
      Math.abs(telemetry.batteryVoltage - telemetry.batteryBusVoltage) >= 0.02)
  ) {
    details.push(`bus ${telemetry.batteryBusVoltage.toFixed(2)}V`)
  }

  if (
    telemetry.batteryRawBusVoltage !== null &&
    (telemetry.batteryBusVoltage === null ||
      Math.abs(telemetry.batteryRawBusVoltage - telemetry.batteryBusVoltage) >= 0.02)
  ) {
    details.push(`raw bus ${telemetry.batteryRawBusVoltage.toFixed(2)}V`)
  }

  if (telemetry.batteryRawLoadVoltage !== null) {
    details.push(`raw load ${telemetry.batteryRawLoadVoltage.toFixed(2)}V`)
  }

  if (details.length > 0) {
    return details.join(" · ")
  }

  return telemetry.batterySensorAvailable ? "Waiting for voltage sample" : "Sensor not reporting"
}

export function getBatteryTelemetryStateLabel(state: BatteryEstimateState) {
  switch (state) {
    case "estimated":
      return "Estimated from voltage"
    case "out_of_range":
      return "Voltage out of range"
    case "sensor_unavailable":
    default:
      return "Sensor unavailable"
  }
}

export function getBatteryTelemetryBadgeVariant(
  state: BatteryEstimateState
): "default" | "secondary" | "destructive" {
  switch (state) {
    case "out_of_range":
      return "destructive"
    case "sensor_unavailable":
      return "secondary"
    case "estimated":
    default:
      return "default"
  }
}
