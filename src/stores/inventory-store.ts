import { create } from "zustand"

import { DEFAULT_SYSTEM_SETTINGS } from "@/constants/app"
import {
  subscribePowerbanks,
  subscribeSystemSettings,
  subscribeTags,
} from "@/services/firebase/data-service"
import type { Powerbank, RfidTag, SystemSettings } from "@/types/models"

interface InventoryState {
  powerbanks: Powerbank[]
  tags: RfidTag[]
  settings: SystemSettings
  loading: boolean
  subscribe: () => () => void
}

let inventorySubscriptionRefCount = 0
let unsubscribeInventoryPowerbanks: (() => void) | null = null
let unsubscribeInventoryTags: (() => void) | null = null
let unsubscribeInventorySettings: (() => void) | null = null

export const useInventoryStore = create<InventoryState>((set) => ({
  powerbanks: [],
  tags: [],
  settings: DEFAULT_SYSTEM_SETTINGS,
  loading: true,
  subscribe: () => {
    inventorySubscriptionRefCount += 1

    if (inventorySubscriptionRefCount === 1) {
      set({ loading: true })

      unsubscribeInventoryPowerbanks = subscribePowerbanks((powerbanks) => {
        set({ powerbanks, loading: false })
      })
      unsubscribeInventoryTags = subscribeTags((tags) => {
        set({ tags })
      })
      unsubscribeInventorySettings = subscribeSystemSettings((settings) => {
        set({ settings })
      })
    }

    return () => {
      inventorySubscriptionRefCount = Math.max(0, inventorySubscriptionRefCount - 1)

      if (inventorySubscriptionRefCount > 0) {
        return
      }

      unsubscribeInventoryPowerbanks?.()
      unsubscribeInventoryTags?.()
      unsubscribeInventorySettings?.()
      unsubscribeInventoryPowerbanks = null
      unsubscribeInventoryTags = null
      unsubscribeInventorySettings = null

      set({
        powerbanks: [],
        tags: [],
        settings: DEFAULT_SYSTEM_SETTINGS,
        loading: true,
      })
    }
  },
}))
