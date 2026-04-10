import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"

import { useCurrentUser, useAuthStore } from "@/stores/auth-store"
import {
  subscribePowerbanks,
  subscribeMyRentals,
  startRental,
  returnRental,
} from "@/services/firebase/data-service"
import { scanSchema, type ScanValues } from "@/schemas/forms"
import { resolveCodeAction, type CodeResolution } from "@/utils/code"
import type { Powerbank, Rental } from "@/types/models"
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
import { QrCodeIcon, ContactIcon, ListIcon, XIcon } from "lucide-react"

type Mode = "get" | "return"
type Method = "qr" | "nfc" | "manual"

const methodConfig = {
  qr: {
    icon: QrCodeIcon,
    title: "QR Code",
    description: "Scan the QR code on the powerbank",
  },
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
  const user = useCurrentUser()
  const authState = useAuthStore()
  const firebaseUser = authState.firebaseUser
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [selectedPowerbankId, setSelectedPowerbankId] = useState<string>("")
  const [activeMethod, setActiveMethod] = useState<Method | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const nfcAbortRef = useRef<AbortController | null>(null)
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
    if (!user) return
    const unsubPowerbanks = subscribePowerbanks(setPowerbanks)
    const unsubRentals = subscribeMyRentals(user.id, setRentals)
    return () => {
      unsubPowerbanks()
      unsubRentals()
    }
  }, [user])

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {})
      nfcAbortRef.current?.abort()
    }
  }, [])

  const handleCode = async (code: string) => {
    if (!code.trim()) return
    const resolution = resolveCodeAction(code.trim(), powerbanks, rentals)
    await doAction(resolution)
  }

  const doAction = async (resolution: CodeResolution) => {
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

  const startQrScanner = async () => {
    setActiveMethod("qr")
    try {
      scannerRef.current = new Html5Qrcode("qr-reader")
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded) => {
          await scannerRef.current?.stop()
          setActiveMethod(null)
          await handleCode(decoded)
        },
        () => {}
      )
    } catch (error) {
      toast.error("Could not start camera")
      setActiveMethod(null)
    }
  }

  const stopQrScanner = async () => {
    try {
      await scannerRef.current?.stop()
    } catch {
      // Ignore
    }
    setActiveMethod(null)
  }

  const startNfcScanner = async () => {
    setActiveMethod("nfc")

    if (!("NDEFReader" in window)) {
      toast.error("NFC not supported on this device")
      setActiveMethod(null)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ndef = new (window as any).NDEFReader()
      nfcAbortRef.current = new AbortController()

      await ndef.scan({ signal: nfcAbortRef.current.signal })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.onreading = async (event: any) => {
        const record = event.message.records[0]
        if (record) {
          const decoder = new TextDecoder()
          const code = decoder.decode(record.data)
          nfcAbortRef.current?.abort()
          setActiveMethod(null)
          await handleCode(code)
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ndef.onreadingerror = () => {
        toast.error("NFC read error")
      }
    } catch (error) {
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
    if (activeMethod === "qr") stopQrScanner()
    else if (activeMethod === "nfc") stopNfcScanner()
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
    if (method === "qr") startQrScanner()
    else if (method === "nfc") startNfcScanner()
    else openManual()
  }

  const listPowerbanks = mode === "return" ? returnablePowerbanks : availablePowerbanks

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {mode === "get" ? "Get Powerbank" : "Return Powerbank"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {mode === "get"
            ? "Select how to rent a powerbank"
            : "Select how to return your powerbank"}
        </p>
      </div>

      {Object.entries(methodConfig).map(([method, config]) => {
        const Icon = config.icon
        const isActive = activeMethod === method
        return (
          <Card
            key={method}
            className={`cursor-pointer transition-all ${
              isActive ? "ring-2 ring-primary" : ""
            } hover:bg-accent`}
            onClick={() => !isProcessing && handleMethodClick(method as Method)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{config.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}

      {activeMethod === "qr" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Scanning...
              <Button variant="ghost" size="sm" onClick={stopQrScanner}>
                <XIcon className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="qr-reader" className="w-full aspect-square bg-muted rounded-lg overflow-hidden" />
          </CardContent>
        </Card>
      )}

      {activeMethod === "nfc" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tap NFC tag now...</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" onClick={stopNfcScanner}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {activeMethod === "manual" && (
        <div className="space-y-4">
          <Card>
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

          <Card>
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