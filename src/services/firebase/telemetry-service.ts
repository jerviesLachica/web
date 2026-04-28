import { onValue, ref } from "firebase/database"

import { rtdb, requireFirebase } from "@/services/firebase/config"
import type { BatteryEstimateState, PowerbankStatus, PowerbankTelemetry } from "@/types/models"

function toFiniteNumber(value: unknown): number | null {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function parseBatteryLevel(value: unknown): number | null {
  const numericValue = toFiniteNumber(value)
  if (numericValue === null) {
    return null
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)))
}

function parseBatteryEstimateState(
  value: unknown,
  fallback: BatteryEstimateState
): BatteryEstimateState {
  return value === "estimated" || value === "out_of_range" || value === "sensor_unavailable"
    ? value
    : fallback
}

function parseInventoryStatus(value: unknown): PowerbankStatus | null {
  return value === "available" ||
    value === "in_use" ||
    value === "rented" ||
    value === "cooldown" ||
    value === "maintenance" ||
    value === "offline"
    ? value
    : null
}

export function subscribeTelemetry(onData: (items: PowerbankTelemetry[]) => void) {
  const realtimeDb = requireFirebase(rtdb, "Realtime Database")

  return onValue(ref(realtimeDb, "telemetry"), (snapshot) => {
    const raw = (snapshot.val() ?? {}) as Record<string, Record<string, unknown>>

    const items = Object.entries(raw).map(([powerbankId, value]) => {
      const batteryLevel = parseBatteryLevel(value.batteryLevel)
      const batteryEstimateState = parseBatteryEstimateState(
        value.batteryEstimateState,
        batteryLevel === null ? "sensor_unavailable" : "estimated"
      )

      return {
        powerbankId,
        online: Boolean(value.online),
        batteryLevel,
        batteryVoltage: toFiniteNumber(value.batteryVoltage),
        batteryBusVoltage: toFiniteNumber(value.batteryBusVoltage),
        batteryShuntVoltageMv: toFiniteNumber(value.batteryShuntVoltageMv),
        batteryRawBusVoltage: toFiniteNumber(value.batteryRawBusVoltage),
        batteryRawShuntVoltageMv: toFiniteNumber(value.batteryRawShuntVoltageMv),
        batteryRawLoadVoltage: toFiniteNumber(value.batteryRawLoadVoltage),
        batterySensorAvailable:
          typeof value.batterySensorAvailable === "boolean"
            ? value.batterySensorAvailable
            : batteryEstimateState !== "sensor_unavailable",
        batteryEstimateState,
        inventoryStatus: parseInventoryStatus(value.inventoryStatus),
        lastSeenAt:
          typeof value.lastSeenAt === "string"
            ? value.lastSeenAt
            : new Date().toISOString(),
        firmwareVersion: String(value.firmwareVersion ?? "unknown"),
        currentMode: String(value.currentMode ?? "idle"),
        relayActive: Boolean(value.relayActive),
        chargeSessionActive: Boolean(value.chargeSessionActive),
        chargeRemainingSeconds: Number(value.chargeRemainingSeconds ?? 0),
        cooldownActive: Boolean(value.cooldownActive),
        cooldownRemainingSeconds: Number(value.cooldownRemainingSeconds ?? 0),
        lastAppliedCommandVersion: Number(value.lastAppliedCommandVersion ?? 0),
        lastEvent:
          value.lastEvent && typeof value.lastEvent === "object"
            ? {
                type: String((value.lastEvent as Record<string, unknown>).type ?? "unknown"),
                result: String(
                  (value.lastEvent as Record<string, unknown>).result ?? "unknown"
                ),
                timestamp: String(
                  (value.lastEvent as Record<string, unknown>).timestamp ??
                    new Date().toISOString()
                ),
              }
            : null,
        lastScan:
          value.lastScan && typeof value.lastScan === "object"
            ? {
                code: String((value.lastScan as Record<string, unknown>).code ?? ""),
                name: String((value.lastScan as Record<string, unknown>).name ?? ""),
                timestamp: String(
                  (value.lastScan as Record<string, unknown>).timestamp ??
                    new Date().toISOString()
                ),
              }
            : null,
      }
    })

    onData(items)
  })
}
