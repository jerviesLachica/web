import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"

import type {
  LoginValues,
  RegisterValues,
  ResetPasswordValues,
} from "@/schemas/forms"
import { auth, requireFirebase } from "@/services/firebase/config"
import {
  ensureUserProfile,
  syncUserVerification,
} from "@/services/firebase/data-service"

export async function signInWithPassword(values: LoginValues) {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")
  await signInWithEmailAndPassword(firebaseAuth, values.email, values.password)
}

export async function registerWithPassword(values: RegisterValues) {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")
  const credentials = await createUserWithEmailAndPassword(
    firebaseAuth,
    values.email,
    values.password
  )

  await updateProfile(credentials.user, {
    displayName: values.name,
  })

  await ensureUserProfile(credentials.user, values.name)
  await sendEmailVerification(credentials.user)
}

export async function sendResetEmail(values: ResetPasswordValues) {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")
  await sendPasswordResetEmail(firebaseAuth, values.email)
}

export async function resendVerificationEmail() {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")

  if (!firebaseAuth.currentUser) {
    throw new Error("You must be signed in to resend verification.")
  }

  await sendEmailVerification(firebaseAuth.currentUser)
}

export async function refreshVerificationState() {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")

  if (!firebaseAuth.currentUser) {
    throw new Error("You must be signed in to refresh verification.")
  }

  await reload(firebaseAuth.currentUser)

  if (firebaseAuth.currentUser.emailVerified) {
    await syncUserVerification(firebaseAuth.currentUser.uid, true)
  }
}

export async function signOutCurrentUser() {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")
  await signOut(firebaseAuth)
}
