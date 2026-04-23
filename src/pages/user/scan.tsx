import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useAuthStore } from "@/stores/auth-store"
import { useInventoryStore } from "@/stores/inventory-store"
import { useIsOnline } from "@/stores/ui-store"
import { useRentalStore } from "@/stores/rental-store"
import { startRental, returnRental } from "@/services/firebase/data-service"
import { scanSchema, type ScanValues } from "@/schemas/forms"
import { resolveCodeAction, type CodeResolution } from "@/utils/code"
import { readNfcTagCode, supportsWebNfc } from "@/utils/nfc"
import type { Powerbank } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  Field,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContactIcon, ListIcon } from "lucide-react"

type Mode = "get" | "return"
type Method = "nfc" | "manual"

const methodConfig = {
  nfc: {
    icon: ContactIcon,
    title: "NFC Tag",
    description: "Tap the NFC tag on the powerbank",
  },
  manual: {
    icon: ListIcon,
    title: "Manual",
    description: "Select from available list or enter code",
  },
}

export function ScanPage() {
  const navigate = useNavigate()
  const authState = useAuthStore()
  const firebaseUser = authState.firebaseUser
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const tags = useInventoryStore((state) => state.tags)
  const rentals = useRentalStore((state) => state.myRentals)
  const isOnline = useIsOnline()
  const [selectedPowerbankId, setSelectedPowerbankId] = useState<string>("")
  const [activeMethod, setActiveMethod] = useState<Method | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const nfcAbortRef = useRef<AbortController | null>(null)
  const webNfcSupported = supportsWebNfc()
  const form = useForm<ScanValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: { code: "" },
  })

  const activeRental = rentals.find((r) => r.status === "active")
  const mode: Mode = activeRental ? "return" : "get"
  const availablePowerbanks = powerbanks.filter((p) => p.status === "available")
  const returnablePowerbanks = rentals
    .filter((r) => r.status === "active")
    .map((r) => powerbanks.find((p) => p.id === r.powerbankId))
    .filter((p): p is Powerbank => p !== undefined)

  useEffect(() => {
    return () => {
      nfcAbortRef.current?.abort()
    }
  }, [])

  const handleCode = async (code: string) => {
    if (!code.trim()) return
    if (!isOnline) {
      toast.error("Reconnect before starting or returning a rental.")
      return
    }
    const resolution = resolveCodeAction(code.trim(), powerbanks, tags, rentals)
    await doAction(resolution)
  }

  const doAction = async (resolution: CodeResolution) => {
    if (!isOnline) {
      toast.error("Reconnect before starting or returning a rental.")
      return
    }

    if (!firebaseUser) {
      toast.error("You must be signed in")
      return
    }

    if (resolution.action === "invalid") {
      toast.error(resolution.reason)
      return
    }

    setIsProcessing(true)

    if (resolution.action === "rent") {
      try {
        await startRental(firebaseUser, resolution.powerbank.id)
        toast.success("Powerbank rented!")
        navigate("/app/dashboard")
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to rent"
        toast.error(msg)
      }
    }

    if (resolution.action === "return") {
      try {
        await returnRental(firebaseUser, resolution.powerbank.id)
        toast.success("Powerbank returned!")
        navigate("/app/dashboard")
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to return"
        toast.error(msg)
      }
    }

    setIsProcessing(false)
  }

  const startNfcScanner = async () => {
    console.log("Starting NFC scanner...")
    setActiveMethod("nfc")
    toast.info("Tap your NFC or RFID tag now...")

    if (!webNfcSupported) {
      toast.error("Phone NFC is not supported here. Use Chrome on Android or Manual mode.")
      setActiveMethod(null)
      return
    }

    try {
      const code = await readNfcTagCode()
      console.log("NFC code:", code)
      setActiveMethod(null)
      await handleCode(code)
    } catch (error) {
      console.log("NFC error:", error)
      const msg = error instanceof Error ? error.message : "NFC not available"
      toast.error(msg)
      setActiveMethod(null)
    }
  }

  const stopNfcScanner = () => {
    nfcAbortRef.current?.abort()
    setActiveMethod(null)
  }

  const openManual = () => {
    setActiveMethod("manual")
  }

  const closeMethod = () => {
    if (activeMethod === "nfc") stopNfcScanner()
    setActiveMethod(null)
  }

  const handleManualSelect = async () => {
    const powerbank = powerbanks.find((p) => p.id === selectedPowerbankId)
    if (!powerbank) {
      toast.error("Select a powerbank")
      return
    }

    const rental = rentals.find(
      (r) => r.powerbankId === powerbank.id && r.status === "active"
    )

    const resolution = rental
      ? { action: "return" as const, powerbank, rental }
      : { action: "rent" as const, powerbank }

    await doAction(resolution)
    closeMethod()
  }

  const handleManualSubmit = form.handleSubmit(async (values) => {
    await handleCode(values.code)
    closeMethod()
  })

  const handleMethodClick = (method: Method) => {
    console.log("Method clicked:", method)
    if (method === "nfc") {
      toast.success("Starting phone NFC scan...")
      startNfcScanner()
    } else {
      openManual()
    }
  }

  const listPowerbanks = mode === "return" ? returnablePowerbanks : availablePowerbanks

  return (
    <div className="mx-auto max-w-md space-y-4 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Scan</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {mode === "get" ? "Get Powerbank" : "Return Powerbank"}
        </h1>
        <p className="text-sm text-white/55">
          {mode === "get"
            ? "Select how to rent a powerbank"
            : "Select how to return your powerbank"}
        </p>
        <p className="text-xs text-white/42">
          Phone NFC works only when the browser exposes a readable tag UID or NDEF text. If your RFID tag is not detected, use Manual mode or the ESP32 reader.
        </p>
      </div>

      {Object.entries(methodConfig).map(([method, config]) => {
        const Icon = config.icon
        const isActive = activeMethod === method
        return (
          <Card
            key={method}
            className={`cursor-pointer transition-all ${
              isActive ? "ring-2 ring-white/20" : ""
            } bg-white/[0.04] hover:bg-white/[0.07]`}
            onClick={() => !isProcessing && handleMethodClick(method as Method)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{config.title}</CardTitle>
                  <p className="text-sm text-white/48">
                    {method === "nfc" && !webNfcSupported
                      ? "Use Android Chrome with NFC enabled, or use Manual mode"
                      : config.description}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}

      {activeMethod === "nfc" && (
          <Card className="bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-base">Tap phone-readable tag now...</CardTitle>
            </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-white/55">
              This uses your phone browser NFC reader. If the tag is only readable by the MFRC522 hardware and not exposed by Web NFC, it will not be detected here.
            </p>
            <Button variant="secondary" className="w-full" onClick={stopNfcScanner}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {activeMethod === "manual" && (
        <div className="space-y-4">
          <Card className="bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-base">
                {mode === "return" ? "Select to Return" : "Select Powerbank"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedPowerbankId} onValueChange={setSelectedPowerbankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select powerbank" />
                </SelectTrigger>
                <SelectContent>
                  {listPowerbanks.map((powerbank) => (
                    <SelectItem key={powerbank.id} value={powerbank.id}>
                      {powerbank.label} - {powerbank.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleManualSelect} disabled={isProcessing} className="flex-1">
                  {isProcessing ? "Processing..." : mode === "return" ? "Return" : "Rent"}
                </Button>
                <Button variant="secondary" onClick={closeMethod}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.04]">
            <CardHeader>
              <CardTitle className="text-base">Enter Code Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <Field>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    )}
                  />
                  <Button type="submit" disabled={isProcessing} className="w-full">
                    Submit
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
