import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { registerWithPassword } from "@/services/firebase/auth-service"
import { registerSchema, type RegisterValues } from "@/schemas/forms"
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

export function RegisterPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      studentId: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true)

    try {
      await registerWithPassword(values)
      toast.success("Account created! Please check your email to verify.")
      navigate("/auth/verify-email")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register"
      toast.error(message)
      form.setError("root", { message })
    } finally {
      setPending(false)
    }
  })

  return (
    <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-white/45">Sunsaver</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Register with a simple form and start using the app.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field>
                  <div className="mb-2 text-sm font-medium text-white/74">
                    <FormLabel>Full name</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Your name"
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
              name="department"
              render={({ field }) => (
                <Field>
                  <div className="mb-2 text-sm font-medium text-white/74">
                    <FormLabel>Department</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Your department"
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
              name="studentId"
              render={({ field }) => (
                <Field>
                  <div className="mb-2 text-sm font-medium text-white/74">
                    <FormLabel>Student ID</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="02000..."
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
                  <div className="mb-2 text-sm font-medium text-white/74">
                    <FormLabel>Password</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pr-11 text-white placeholder:text-white/28 focus-visible:border-white/20 focus-visible:ring-white/10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/75"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </Field>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <Field>
                  <div className="mb-2 text-sm font-medium text-white/74">
                    <FormLabel>Confirm password</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pr-11 text-white placeholder:text-white/28 focus-visible:border-white/20 focus-visible:ring-white/10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/75"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </Field>
              )}
            />
          </div>

          {form.formState.errors.root && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl bg-white text-black transition-colors hover:bg-white/90"
            disabled={pending}
          >
            {pending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 border-t border-white/10 pt-6 text-center">
        <p className="text-sm text-white/55">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-white transition-colors hover:text-white/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
