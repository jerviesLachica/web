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
  Field,
} from "@/components/ui/form"

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
      const user = await signInWithPassword(values)
      toast.success("Welcome back!")
      navigate(user.emailVerified ? "/app" : "/auth/verify-email")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign in"
      toast.error(message)
      form.setError("root", { message })
    } finally {
      setPending(false)
    }
  })

  return (
    <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-white/45">Sunsaver</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Access your account with a clean and simple login flow.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <Field>
                <div className="mb-2 text-sm font-medium text-white/74">
                  <FormLabel>Email</FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/28 focus-visible:border-white/20 focus-visible:ring-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <Field>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white/74">
                    <FormLabel>Password</FormLabel>
                  </div>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-white/55 transition-colors hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/28 focus-visible:border-white/20 focus-visible:ring-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            )}
          />

          {form.formState.errors.root && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-2xl bg-white text-black transition-colors hover:bg-white/90"
          >
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 border-t border-white/10 pt-6 text-center">
        <p className="text-sm text-white/55">
          Don&apos;t have an account?{" "}
          <Link to="/auth/register" className="text-white transition-colors hover:text-white/80">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
