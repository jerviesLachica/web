import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { create } from "zustand"

import { auth, requireFirebase } from "@/services/firebase/config"
import { subscribeCurrentUserProfile } from "@/services/firebase/data-service"
import type { AppUser } from "@/types/models"

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: AppUser | null
  loading: boolean
  initialized: boolean
  subscribe: () => () => void
}

export type { AuthState }

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  loading: true,
  initialized: false,

  subscribe: () => {
    try {
      const firebaseAuth = requireFirebase(auth, "Firebase Auth")

      const unsubscribeAuth = onAuthStateChanged(
        firebaseAuth,
        async (firebaseUser) => {
          set({ firebaseUser, loading: true })

          if (!firebaseUser) {
            set({ user: null, loading: false, initialized: true })
            return
          }

          const unsubscribeProfile = subscribeCurrentUserProfile(
            firebaseUser.uid,
            (user) => {
              set({ user, loading: false, initialized: true })
            }
          )

          return unsubscribeProfile
        }
      )

      return () => {
        unsubscribeAuth()
      }
    } catch (error) {
      console.error("Auth subscription error:", error)
      set({ loading: false, initialized: true })
      return () => {}
    }
  },
}))

export function useAuth() {
  return useAuthStore()
}

export function useIsAuthenticated() {
  const { firebaseUser, initialized } = useAuthStore()
  return initialized && !!firebaseUser
}

export function useCurrentUser() {
  return useAuthStore((state) => state.user)
}

export function useIsAdmin() {
  return useAuthStore((state) => state.user?.role === "admin")
}

export function useIsVerified() {
  return useAuthStore((state) => state.firebaseUser?.emailVerified ?? false)
}
