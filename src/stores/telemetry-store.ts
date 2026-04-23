import { create } from "zustand"

import { subscribeTelemetry } from "@/services/firebase/telemetry-service"
import type { PowerbankTelemetry } from "@/types/models"

interface TelemetryState {
  items: PowerbankTelemetry[]
  loading: boolean
  subscribe: () => () => void
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  items: [],
  loading: true,
  subscribe: () => {
    set({ loading: true })

    const unsubscribe = subscribeTelemetry((items) => {
      set({ items, loading: false })
    })

    return () => {
      unsubscribe()
      set({ items: [], loading: true })
    }
  },
}))
