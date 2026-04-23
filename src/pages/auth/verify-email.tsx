import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import {
  refreshVerificationState,
  resendVerificationEmail,
} from "@/services/firebase/auth-service"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const firebaseUser = useAuthStore((state) => state.firebaseUser)
  const user = useAuthStore((state) => state.user)
  const [pending, setPending] = useState<"refresh" | "resend" | null>(null)

  const handleRefresh = async () => {
    setPending("refresh")
    try {
      const verified = await refreshVerificationState()
      toast.success("Verification state refreshed.")

      if (verified) {
        navigate(user?.role === "admin" ? "/admin" : "/app", { replace: true })
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not refresh verification state."
      )
    } finally {
      setPending(null)
    }
  }

  const handleResend = async () => {
    setPending("resend")
    try {
      await resendVerificationEmail()
      toast.success("Verification email sent.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not resend verification email."
      )
    } finally {
      setPending(null)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Confirm your inbox before using the rental flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{firebaseUser?.email}</span>.
          Open the verification email from Firebase, then return here.
        </p>
        <div className="grid gap-3">
          <Button onClick={handleRefresh} disabled={pending !== null}>
            {pending === "refresh" ? "Checking..." : "I verified my email"}
          </Button>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={pending !== null}
          >
            {pending === "resend" ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
