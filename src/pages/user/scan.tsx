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
import { resolveQrAction } from "@/utils/qr"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ScanPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const authState = useAuthStore()
  const firebaseUser = authState.firebaseUser
  const [scanning, setScanning] = useState(false)
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
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
          scannerRef.current?.stop().then(() => setScanning(false))
        },
        () => {}
      )
      setScanning(true)
    } catch {
      toast.error("Could not start camera")
    }
  }

  const stopScanner = async () => {
    await scannerRef.current?.stop()
    setScanning(false)
  }

  const handleScan = async (code: string) => {
    if (!firebaseUser) {
      toast.error("You must be signed in")
      return
    }

    const resolution = resolveQrAction(code, powerbanks, rentals)

    if (resolution.action === "invalid") {
      toast.error(resolution.reason)
      return
    }

    if (resolution.action === "rent") {
      try {
        await startRental(firebaseUser, resolution.powerbank.id)
        toast.success("Powerbank rented successfully!")
        navigate("/app/dashboard")
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Failed to rent"
        toast.error(msg)
      }
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

  const onSubmit = form.handleSubmit(async (values) => {
    await handleScan(values.code)
  })

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scan QR Code</h1>
        <p className="text-muted-foreground">Scan a powerbank QR code to rent or return</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Camera Scanner</CardTitle>
          <CardDescription>
            Point your camera at the powerbank QR code
          </CardDescription>
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
          <CardTitle>Manual Entry</CardTitle>
          <CardDescription>Or enter the code manually</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Field>
                    <FormLabel>QR Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter powerbank code" {...field} />
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
