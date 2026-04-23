import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { create } from "zustand"

import { auth, requireFirebase } from "@/services/firebase/config"
import { ensureUserProfile, getUserProfile, subscribeCurrentUserProfile } from "@/services/firebase/data-service"
import type { AppUser } from "@/types/models"

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: AppUser | null
  loading: boolean
  initialized: boolean
  subscribe: () => () => void
  markOnboardingCompleted: () => void
}

export type { AuthState }

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  user: null,
  loading: true,
  initialized: false,
  markOnboardingCompleted: () => {
    set((state) => {
      if (!state.user) {
        return state
      }

      return {
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            onboardingCompleted: true,
          },
        },
      }
    })
  },

  subscribe: () => {
    try {
      const firebaseAuth = requireFirebase(auth, "Firebase Auth")
      let unsubscribeProfile: (() => void) | null = null

      const unsubscribeAuth = onAuthStateChanged(
        firebaseAuth,
        async (firebaseUser) => {
          unsubscribeProfile?.()
          unsubscribeProfile = null
          set({ firebaseUser, loading: true })

          if (!firebaseUser) {
            set({ user: null, loading: false, initialized: true })
            return
          }

          try {
            await ensureUserProfile(firebaseUser)
          } catch (e) {
            set({ loading: false, initialized: true })
            return
          }

          unsubscribeProfile = subscribeCurrentUserProfile(
            firebaseUser.uid,
            async (user) => {
              if (!user) {
                try {
                  await ensureUserProfile(firebaseUser)
                  const newProfile = await getUserProfile(firebaseUser.uid)
                  set({ user: newProfile, loading: false, initialized: true })
                } catch (e) {
                  set({ loading: false, initialized: true })
                }
              } else {
                set({ user, loading: false, initialized: true })
              }
            }
          )
        }
      )

      return () => {
        unsubscribeProfile?.()
        unsubscribeAuth()
      }
    } catch (error) {
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
