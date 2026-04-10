import { getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth"
import {
  connectDatabaseEmulator,
  getDatabase,
  type Database,
} from "firebase/database"
import {
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
  getFirestore,
  type Firestore,
} from "firebase/firestore"

import { FIREBASE_SETUP_MESSAGE } from "@/constants/app"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)
export const useFirebaseEmulators =
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null
let emulatorsConnected = false

if (isFirebaseConfigured) {
  firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
  db = getFirestore(firebaseApp)
  rtdb = getDatabase(firebaseApp)

  setPersistence(auth, browserLocalPersistence).catch(() => undefined)
  enableMultiTabIndexedDbPersistence(db).catch(() => undefined)

  if (useFirebaseEmulators && !emulatorsConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    })
    connectFirestoreEmulator(db, "127.0.0.1", 8080)
    connectDatabaseEmulator(rtdb, "127.0.0.1", 9000)
    emulatorsConnected = true
  }
}

export { firebaseApp, auth, db, rtdb }

export function requireFirebase<T>(value: T | null, name: string): T {
  if (!value) {
    throw new Error(`${name} is unavailable. ${FIREBASE_SETUP_MESSAGE}`)
  }

  return value
}
