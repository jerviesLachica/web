import { create } from "zustand"

import {
  subscribeAllRentals,
  subscribeMyRentals,
} from "@/services/firebase/data-service"
import type { Rental } from "@/types/models"

interface RentalState {
  myRentals: Rental[]
  allRentals: Rental[]
  myLoading: boolean
  allLoading: boolean
  subscribeMy: (userId: string) => () => void
  subscribeAll: () => () => void
}

export const useRentalStore = create<RentalState>((set) => ({
  myRentals: [],
  allRentals: [],
  myLoading: true,
  allLoading: true,
  subscribeMy: (userId) => {
    set({ myLoading: true })

    const unsubscribe = subscribeMyRentals(userId, (myRentals) => {
      set({ myRentals, myLoading: false })
    })

    return () => {
      unsubscribe()
      set({ myRentals: [], myLoading: true })
    }
  },
  subscribeAll: () => {
    set({ allLoading: true })

    const unsubscribe = subscribeAllRentals((allRentals) => {
      set({ allRentals, allLoading: false })
    })

    return () => {
      unsubscribe()
      set({ allRentals: [], allLoading: true })
    }
  },
}))
