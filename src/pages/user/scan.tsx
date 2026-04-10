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
  CardDescription,
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

async function scanNfc(): Promise<string | null> {
  if (!("NDEFReader" in window)) {
    throw new Error("NFC not supported on this device")
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ndef = new (window as any).NDEFReader()
  await ndef.scan()
  return new Promise<string | null>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ndef.onreadingerror = () => resolve(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ndef.onreading = (event: any) => {
      const record = event.message.records[0]
      if (record) {
        const decoder = new TextDecoder()
        resolve(decoder.decode(record.data))
      } else {
        resolve(null)
      }
    }
  })
}

export function ScanPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const authState = useAuthStore()
  const firebaseUser = authState.firebaseUser
  const [scanning, setScanning] = useState(false)
  const [nfcScanning, setNfcScanning] = useState(false)
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [selectedPowerbankId, setSelectedPowerbankId] = useState<string>("")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const form = useForm<ScanValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: { code: "" },
  })

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
    }
  }, [])

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("qr-reader")
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          form.setValue("code", decoded)
          handleScan(decoded)
          scannerRef.current?.stop().then(() => setScanning(false)).catch(() => {})
        },
        () => {}
      )
      setScanning(true)
    } catch {
      toast.error("Could not start camera")
    }
  }

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
      }
    } catch {
      // Ignore scanner errors when stopping
    } finally {
      setScanning(false)
    }
  }

  const startNfc = async () => {
    try {
      setNfcScanning(true)
      const code = await scanNfc()
      if (code) {
        await handleScan(code)
      } else {
        toast.error("Could not read NFC tag")
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "NFC not available"
      toast.error(msg)
    } finally {
      setNfcScanning(false)
    }
  }

  const doReturn = async (resolution: CodeResolution) => {
    if (!firebaseUser) {
      toast.error("You must be signed in")
      return
    }

    if (resolution.action === "invalid") {
      toast.error(resolution.reason)
      return
    }

    if (resolution.action === "rent") {
      toast.error("You don't have an active rental for this powerbank")
      return
    }

    if (resolution.action === "return") {
      try {
        await returnRental(firebaseUser, resolution.powerbank.id)
        toast.success("Powerbank returned successfully!")
        navigate("/app/dashboard")
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to return"
        toast.error(msg)
      }
    }
  }

  const handleScan = async (code: string) => {
    const resolution = resolveCodeAction(code, powerbanks, rentals)
    await doReturn(resolution)
  }

  const handleManualSelect = async () => {
    if (!selectedPowerbankId) {
      toast.error("Select a powerbank")
      return
    }

    const powerbank = powerbanks.find((p) => p.id === selectedPowerbankId)
    if (!powerbank) return

    const rental = rentals.find(
      (r) => r.powerbankId === powerbank.id && r.status === "active"
    )

    if (!rental) {
      toast.error("No active rental for this powerbank")
      return
    }

    const resolution = { action: "return" as const, powerbank, rental }
    await doReturn(resolution)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    await handleScan(values.code)
  })

  const activeRentals = rentals.filter((r) => r.status === "active")

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Return Powerbank</h1>
        <p className="text-muted-foreground">
          Scan QR, tap NFC, or select to return
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera Scanner</CardTitle>
          <CardDescription>Scan QR code on powerbank</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            id="qr-reader"
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
          />
          <div className="flex gap-2">
            {!scanning ? (
              <Button onClick={startScanner} className="flex-1">
                Start Scanner
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="secondary" className="flex-1">
                Stop Scanner
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>NFC Tag</CardTitle>
          <CardDescription>Tap NFC tag on powerbank</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={startNfc}
            disabled={nfcScanning}
            className="w-full"
          >
            {nfcScanning ? "Tap powerbank now..." : "Tap to Scan NFC"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Selection</CardTitle>
          <CardDescription>Select powerbank to return</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPowerbankId} onValueChange={setSelectedPowerbankId}>
            <SelectTrigger>
              <SelectValue placeholder="Select powerbank" />
            </SelectTrigger>
            <SelectContent>
              {activeRentals.map((rental) => {
                const pb = powerbanks.find((p) => p.id === rental.powerbankId)
                return pb ? (
                  <SelectItem key={pb.id} value={pb.id}>
                    {pb.label} - {pb.location}
                  </SelectItem>
                ) : null
              })}
            </SelectContent>
          </Select>
          <Button onClick={handleManualSelect} className="w-full">
            Return Powerbank
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
          <CardDescription>Enter code manually</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}