const TAG_PREFIX = "SUNSAVER:TAG:"

type NdefReaderLike = {
  scan: () => Promise<void>
  write: (message: unknown) => Promise<void>
  onreading: ((event: {
    serialNumber?: string
    message?: { records?: Array<Record<string, unknown>> }
  }) => void) | null
  onreadingerror: (() => void) | null
}

declare global {
  interface Window {
    NDEFReader?: new () => NdefReaderLike
  }
}

export function supportsWebNfc() {
  return typeof window !== "undefined" && typeof window.NDEFReader === "function"
}

export function generateRfidTagCode() {
  const seed =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14)

  return `${TAG_PREFIX}${seed.toUpperCase()}`
}

export function normalizeRfidTagCode(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""

  const upper = trimmed.toUpperCase()
  if (upper.startsWith(TAG_PREFIX)) {
    return `${TAG_PREFIX}${trimmed.slice(TAG_PREFIX.length).replace(/\s+/g, "").toUpperCase()}`
  }

  const compactHex = upper.replace(/[^0-9A-F]/g, "")
  const looksLikeHardwareUid =
    compactHex.length >= 4 &&
    compactHex.length <= 32 &&
    compactHex.length % 2 === 0 &&
    /^[0-9A-F:\-\s]+$/.test(upper)

  if (looksLikeHardwareUid) {
    return compactHex
  }

  return trimmed
}

function decodeRecord(record: Record<string, unknown>) {
  const data = record.data
  if (!(data instanceof DataView)) {
    return null
  }

  return new TextDecoder().decode(data).trim()
}

function extractNfcCode(event: {
  serialNumber?: string
  message?: { records?: Array<Record<string, unknown>> }
}) {
  const serialNumber = normalizeRfidTagCode(event.serialNumber ?? "")
  if (serialNumber) {
    return serialNumber
  }

  const records = event.message?.records ?? []
  for (const record of records) {
    const value = normalizeRfidTagCode(decodeRecord(record) ?? "")
    if (value) {
      return value
    }
  }

  return ""
}

export async function readNfcTagCode(timeoutMs = 15000) {
  if (!supportsWebNfc()) {
    throw new Error("Web NFC is only available in supported mobile browsers.")
  }

  const reader = new window.NDEFReader!()

  return await new Promise<string>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("NFC read timed out."))
    }, timeoutMs)

    const cleanup = () => {
      window.clearTimeout(timeout)
      reader.onreading = null
      reader.onreadingerror = null
    }

    reader.onreadingerror = () => {
      cleanup()
      reject(new Error("Could not read NFC tag."))
    }

    reader.onreading = (event) => {
      const value = extractNfcCode(event)
      if (!value) {
        cleanup()
        reject(
          new Error(
            "NFC tag was detected but no readable UID or text record was exposed by this browser. Use Manual mode or scan with the ESP32 reader."
          )
        )
        return
      }

      cleanup()
      resolve(value)
    }

    reader.scan().catch((error: unknown) => {
      cleanup()
      reject(error instanceof Error ? error : new Error("Failed to start NFC scan."))
    })
  })
}

export async function writeNfcTagCode(code: string) {
  if (!supportsWebNfc()) {
    throw new Error("Web NFC is only available in supported mobile browsers.")
  }

  const reader = new window.NDEFReader!()
  const normalized = normalizeRfidTagCode(code)

  await reader.write({
    records: [
      {
        recordType: "text",
        data: normalized,
      },
    ],
  })

  return normalized
}
