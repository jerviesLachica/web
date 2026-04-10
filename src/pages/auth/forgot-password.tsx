import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { sendResetEmail } from "@/services/firebase/auth-service"
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/forms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true)
    try {
      await sendResetEmail(values)
      toast.success("Password reset email sent! Check your inbox.")
      navigate("/auth/login")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email"
      toast.error(message)
      form.setError("root", { message })
    } finally {
      setPending(false)
    }
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormField>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormField>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Remember your password? </span>
          <Link to="/auth/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
