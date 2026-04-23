import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type AuthError,
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

function mapAuthError(error: unknown) {
  const code = (error as AuthError | undefined)?.code

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password."
    case "auth/too-many-requests":
      return "Too many failed sign-in attempts. Try again later."
    case "auth/user-disabled":
      return "This account has been disabled. Contact an administrator."
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Choose a stronger password."
    default:
      return "Authentication failed."
  }
}

export async function signInWithPassword(values: LoginValues) {
  try {
    const firebaseAuth = requireFirebase(auth, "Firebase Auth")
    const credentials = await signInWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password
    )

    return credentials.user
  } catch (error) {
    throw new Error(mapAuthError(error))
  }
}

export async function registerWithPassword(values: RegisterValues) {
  try {
    const firebaseAuth = requireFirebase(auth, "Firebase Auth")
    const credentials = await createUserWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password
    )

    await updateProfile(credentials.user, {
      displayName: values.name,
    })

    await ensureUserProfile(credentials.user, {
      name: values.name,
      profile: {
        phone: "",
        department: values.department?.trim() ?? "",
        studentId: values.studentId?.trim() ?? "",
      },
    })
    await sendEmailVerification(credentials.user)

    return credentials.user
  } catch (error) {
    throw new Error(mapAuthError(error))
  }
}

export async function sendResetEmail(values: ResetPasswordValues) {
  try {
    const firebaseAuth = requireFirebase(auth, "Firebase Auth")
    await sendPasswordResetEmail(firebaseAuth, values.email)
  } catch (error) {
    throw new Error(mapAuthError(error))
  }
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

  const verified = firebaseAuth.currentUser.emailVerified

  if (verified) {
    await syncUserVerification(firebaseAuth.currentUser.uid, true)
  }

  return verified
}

export async function signOutCurrentUser() {
  const firebaseAuth = requireFirebase(auth, "Firebase Auth")
  await signOut(firebaseAuth)
}
