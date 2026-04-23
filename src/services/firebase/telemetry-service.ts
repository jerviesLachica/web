import { onValue, ref } from "firebase/database"

import { rtdb, requireFirebase } from "@/services/firebase/config"
import type { PowerbankTelemetry } from "@/types/models"

export function subscribeTelemetry(onData: (items: PowerbankTelemetry[]) => void) {
  const realtimeDb = requireFirebase(rtdb, "Realtime Database")

  return onValue(ref(realtimeDb, "telemetry"), (snapshot) => {
    const raw = (snapshot.val() ?? {}) as Record<string, Record<string, unknown>>

    const items = Object.entries(raw).map(([powerbankId, value]) => ({
      powerbankId,
      online: Boolean(value.online),
      batteryLevel: Number(value.batteryLevel ?? 0),
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
    }))

    onData(items)
  })
}
