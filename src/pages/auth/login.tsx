import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { signInWithPassword } from "@/services/firebase/auth-service"
import { loginSchema, type LoginValues } from "@/schemas/forms"
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

export function LoginPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true)
    try {
      await signInWithPassword(values)
      toast.success("Welcome back!")
      navigate("/app")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign in"
      toast.error(message)
      form.setError("root", { message })
    } finally {
      setPending(false)
    }
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormField>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
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
              {pending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link to="/auth/register" className="text-primary hover:underline">
            Register
          </Link>
        </div>
        <div className="mt-2 text-center text-sm">
          <Link to="/auth/forgot-password" className="text-muted-foreground hover:underline">
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
