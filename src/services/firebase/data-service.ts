import { addHours } from "date-fns"
import type { User as FirebaseUser } from "firebase/auth"
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"

import {
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_USER_PROFILE,
} from "@/constants/app"
import { db, requireFirebase } from "@/services/firebase/config"
import type {
  AppUser,
  AuditLog,
  Powerbank,
  Rental,
  SystemSettings,
  UserStatus,
} from "@/types/models"
import type {
  PowerbankValues,
  PreferencesValues,
  ProfileValues,
  SystemSettingsValues,
} from "@/schemas/forms"

function toIso(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (typeof value === "string") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date().toISOString()
}

function mapUserDocument(id: string, data: DocumentData): AppUser {
  return {
    id,
    email: data.email ?? "",
    name: data.name ?? "",
    role: data.role ?? "user",
    status: data.status ?? "active",
    emailVerified: Boolean(data.emailVerified),
    activeRentalId: data.activeRentalId ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    profile: {
      ...DEFAULT_USER_PROFILE,
      ...(data.profile ?? {}),
    },
    preferences: {
      ...DEFAULT_USER_PREFERENCES,
      ...(data.preferences ?? {}),
    },
  }
}

function mapPowerbankDocument(id: string, data: DocumentData): Powerbank {
  return {
    id,
    label: data.label ?? id,
    qrCode: data.qrCode ?? "",
    rfidTagId: data.rfidTagId ?? "",
    location: data.location ?? "",
    status: data.status ?? "available",
    currentRentalId: data.currentRentalId ?? null,
    deviceAuthUid: data.deviceAuthUid ?? null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    deviceControl: {
      desiredAction: data.deviceControl?.desiredAction ?? "idle",
      commandVersion: Number(data.deviceControl?.commandVersion ?? 0),
      updatedAt: toIso(data.deviceControl?.updatedAt),
    },
  }
}

function mapRentalDocument(id: string, data: DocumentData): Rental {
  return {
    id,
    userId: data.userId ?? "",
    powerbankId: data.powerbankId ?? "",
    startedAt: toIso(data.startedAt),
    dueAt: toIso(data.dueAt),
    returnedAt: data.returnedAt ? toIso(data.returnedAt) : null,
    status: data.status ?? "active",
    notes: data.notes ?? "",
  }
}

function mapAuditDocument(id: string, data: DocumentData): AuditLog {
  return {
    id,
    actorType: data.actorType ?? "system",
    actorId: data.actorId ?? "system",
    action: data.action ?? "unknown",
    targetType: data.targetType ?? "settings",
    targetId: data.targetId ?? "settings/system",
    metadata: data.metadata ?? {},
    createdAt: toIso(data.createdAt),
  }
}

function mapSettingsDocument(data?: DocumentData): SystemSettings {
  return {
    defaultRentalHours:
      Number(data?.defaultRentalHours ?? DEFAULT_SYSTEM_SETTINGS.defaultRentalHours),
    overdueGraceMinutes:
      Number(
        data?.overdueGraceMinutes ?? DEFAULT_SYSTEM_SETTINGS.overdueGraceMinutes
      ),
    maintenanceMode: Boolean(
      data?.maintenanceMode ?? DEFAULT_SYSTEM_SETTINGS.maintenanceMode
    ),
  }
}

export async function ensureUserProfile(user: FirebaseUser, name?: string) {
  const firestore = requireFirebase(db, "Firestore")
  const userRef = doc(firestore, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email ?? "",
      name: name ?? user.displayName ?? user.email?.split("@")[0] ?? "New User",
      role: "user",
      status: "active",
      emailVerified: user.emailVerified,
      activeRentalId: null,
      profile: DEFAULT_USER_PROFILE,
      preferences: DEFAULT_USER_PREFERENCES,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  const current = snapshot.data()

  if (current.emailVerified !== user.emailVerified || !current.name) {
    await updateDoc(userRef, {
      emailVerified: user.emailVerified,
      name:
        current.name ??
        name ??
        user.displayName ??
        user.email?.split("@")[0] ??
        "New User",
      updatedAt: serverTimestamp(),
    })
  }
}

export async function syncUserVerification(userId: string, emailVerified: boolean) {
  const firestore = requireFirebase(db, "Firestore")

  await updateDoc(doc(firestore, "users", userId), {
    emailVerified,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeCurrentUserProfile(
  userId: string,
  onData: (profile: AppUser | null) => void
) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(doc(firestore, "users", userId), (snapshot) => {
    if (!snapshot.exists()) {
      onData(null)
      return
    }

    onData(mapUserDocument(snapshot.id, snapshot.data()))
  })
}

export async function getUserProfile(userId: string): Promise<AppUser | null> {
  const firestore = requireFirebase(db, "Firestore")
  const snapshot = await getDoc(doc(firestore, "users", userId))
  
  if (!snapshot.exists()) {
    return null
  }
  
  return mapUserDocument(snapshot.id, snapshot.data())
}

export function subscribePowerbanks(onData: (items: Powerbank[]) => void) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(
    query(collection(firestore, "powerbanks"), orderBy("label")),
    (snapshot) => {
      onData(
        snapshot.docs.map((item) => mapPowerbankDocument(item.id, item.data()))
      )
    }
  )
}

export function subscribeSystemSettings(onData: (settings: SystemSettings) => void) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(doc(firestore, "settings", "system"), (snapshot) => {
    onData(mapSettingsDocument(snapshot.data()))
  })
}

export function subscribeMyRentals(
  userId: string,
  onData: (items: Rental[]) => void
) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(
    query(collection(firestore, "rentals"), orderBy("startedAt", "desc")),
    (snapshot) => {
      const items = snapshot.docs
        .map((item) => mapRentalDocument(item.id, item.data()))
        .filter((item) => item.userId === userId)

      onData(items)
    }
  )
}

export function subscribeAllRentals(onData: (items: Rental[]) => void) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(
    query(collection(firestore, "rentals"), orderBy("startedAt", "desc")),
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapRentalDocument(item.id, item.data())))
    }
  )
}

export function subscribeUsers(onData: (items: AppUser[]) => void) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(
    query(collection(firestore, "users"), orderBy("name")),
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapUserDocument(item.id, item.data())))
    }
  )
}

export function subscribeAuditLogs(onData: (items: AuditLog[]) => void) {
  const firestore = requireFirebase(db, "Firestore")

  return onSnapshot(
    query(collection(firestore, "auditLogs"), orderBy("createdAt", "desc")),
    (snapshot) => {
      onData(snapshot.docs.map((item) => mapAuditDocument(item.id, item.data())))
    }
  )
}

export async function updateUserProfile(userId: string, values: ProfileValues) {
  const firestore = requireFirebase(db, "Firestore")

  await updateDoc(doc(firestore, "users", userId), {
    name: values.name,
    profile: {
      phone: values.phone,
      department: values.department,
      studentId: values.studentId,
    },
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserPreferences(
  userId: string,
  values: PreferencesValues
) {
  const firestore = requireFirebase(db, "Firestore")

  await updateDoc(doc(firestore, "users", userId), {
    preferences: values,
    updatedAt: serverTimestamp(),
  })
}

export async function savePowerbank(
  values: PowerbankValues,
  existing?: Powerbank | null
) {
  const firestore = requireFirebase(db, "Firestore")

  if (existing) {
    await updateDoc(doc(firestore, "powerbanks", existing.id), {
      label: values.label,
      qrCode: values.qrCode,
      rfidTagId: values.rfidTagId,
      location: values.location,
      deviceAuthUid: values.deviceAuthUid?.trim() || null,
      status: values.status,
      updatedAt: serverTimestamp(),
    })
    return
  }

  const ref = doc(collection(firestore, "powerbanks"))

  await setDoc(ref, {
    label: values.label,
    qrCode: values.qrCode,
    rfidTagId: values.rfidTagId,
    location: values.location,
    status: values.status,
    currentRentalId: null,
    deviceAuthUid: values.deviceAuthUid?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deviceControl: {
      desiredAction: "idle",
      commandVersion: 0,
      updatedAt: serverTimestamp(),
    },
  })
}

export async function updateManagedUserStatus(userId: string, status: UserStatus) {
  const firestore = requireFirebase(db, "Firestore")

  await updateDoc(doc(firestore, "users", userId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function saveSystemSettings(values: SystemSettingsValues) {
  const firestore = requireFirebase(db, "Firestore")

  await setDoc(
    doc(firestore, "settings", "system"),
    {
      defaultRentalHours: values.defaultRentalHours,
      overdueGraceMinutes: values.overdueGraceMinutes,
      maintenanceMode: values.maintenanceMode,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function startRental(user: FirebaseUser, powerbankId: string) {
  const firestore = requireFirebase(db, "Firestore")

  if (!user.emailVerified) {
    throw new Error("Verify your email before renting a powerbank.")
  }

  const userRef = doc(firestore, "users", user.uid)
  const powerbankRef = doc(firestore, "powerbanks", powerbankId)
  const settingsRef = doc(firestore, "settings", "system")
  const rentalRef = doc(collection(firestore, "rentals"))
  const auditRef = doc(collection(firestore, "auditLogs"))

  await runTransaction(firestore, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)
    const powerbankSnapshot = await transaction.get(powerbankRef)
    const settingsSnapshot = await transaction.get(settingsRef)

    if (!userSnapshot.exists()) {
      throw new Error("User profile is missing.")
    }

    if (!powerbankSnapshot.exists()) {
      throw new Error("Powerbank was not found.")
    }

    const profile = mapUserDocument(userSnapshot.id, userSnapshot.data())
    const powerbank = mapPowerbankDocument(
      powerbankSnapshot.id,
      powerbankSnapshot.data()
    )
    const settings = mapSettingsDocument(settingsSnapshot.data())

    if (profile.status !== "active") {
      throw new Error("This account cannot start new rentals.")
    }

    if (settings.maintenanceMode) {
      throw new Error("The system is in maintenance mode.")
    }

    if (profile.activeRentalId) {
      throw new Error("Return your current rental before taking another one.")
    }

    if (powerbank.status !== "available") {
      throw new Error("That powerbank is not available right now.")
    }

    const startedAt = Timestamp.now()
    const dueAt = Timestamp.fromDate(
      addHours(startedAt.toDate(), settings.defaultRentalHours)
    )
    const nextCommandVersion = powerbank.deviceControl.commandVersion + 1

    transaction.set(rentalRef, {
      userId: user.uid,
      powerbankId,
      startedAt,
      dueAt,
      returnedAt: null,
      status: "active",
      notes: "",
    })

    transaction.update(userRef, {
      activeRentalId: rentalRef.id,
      emailVerified: true,
      updatedAt: serverTimestamp(),
    })

    transaction.update(powerbankRef, {
      status: "rented",
      currentRentalId: rentalRef.id,
      updatedAt: serverTimestamp(),
      deviceControl: {
        desiredAction: "unlock",
        commandVersion: nextCommandVersion,
        updatedAt: Timestamp.now(),
      },
    })

    transaction.set(auditRef, {
      actorType: profile.role,
      actorId: user.uid,
      action: "rental.started",
      targetType: "rental",
      targetId: rentalRef.id,
      metadata: {
        powerbankId,
      },
      createdAt: serverTimestamp(),
    })
  })
}

export async function returnRental(user: FirebaseUser, powerbankId: string) {
  const firestore = requireFirebase(db, "Firestore")
  const userRef = doc(firestore, "users", user.uid)
  const powerbankRef = doc(firestore, "powerbanks", powerbankId)
  const auditRef = doc(collection(firestore, "auditLogs"))

  await runTransaction(firestore, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)
    const powerbankSnapshot = await transaction.get(powerbankRef)

    if (!userSnapshot.exists()) {
      throw new Error("User profile is missing.")
    }

    if (!powerbankSnapshot.exists()) {
      throw new Error("Powerbank was not found.")
    }

    const profile = mapUserDocument(userSnapshot.id, userSnapshot.data())
    const powerbank = mapPowerbankDocument(
      powerbankSnapshot.id,
      powerbankSnapshot.data()
    )

    if (!profile.activeRentalId) {
      throw new Error("You do not have an active rental to return.")
    }

    if (powerbank.currentRentalId !== profile.activeRentalId) {
      throw new Error("That QR code does not match your active rental.")
    }

    const rentalRef = doc(firestore, "rentals", profile.activeRentalId)
    const rentalSnapshot = await transaction.get(rentalRef)

    if (!rentalSnapshot.exists()) {
      throw new Error("The active rental record could not be found.")
    }

    const nextCommandVersion = powerbank.deviceControl.commandVersion + 1

    transaction.update(rentalRef, {
      returnedAt: Timestamp.now(),
      status: "returned",
    })

    transaction.update(userRef, {
      activeRentalId: null,
      updatedAt: serverTimestamp(),
    })

    transaction.update(powerbankRef, {
      status: "available",
      currentRentalId: null,
      updatedAt: serverTimestamp(),
      deviceControl: {
        desiredAction: "lock",
        commandVersion: nextCommandVersion,
        updatedAt: Timestamp.now(),
      },
    })

    transaction.set(auditRef, {
      actorType: profile.role,
      actorId: user.uid,
      action: "rental.returned",
      targetType: "rental",
      targetId: rentalRef.id,
      metadata: {
        powerbankId,
      },
      createdAt: serverTimestamp(),
    })
  })
}
