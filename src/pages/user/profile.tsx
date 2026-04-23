import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { LogOutIcon } from "lucide-react"

import { useCurrentUser } from "@/stores/auth-store"
import { updateUserProfile, updateUserPreferences } from "@/services/firebase/data-service"
import { ensureReminderPermission } from "@/services/rental-reminder-service"
import { profileSchema, preferencesSchema, type ProfileValues, type PreferencesValues } from "@/schemas/forms"
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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const [saving, setSaving] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.profile.phone ?? "",
      department: user?.profile.department ?? "",
      studentId: user?.profile.studentId ?? "",
    },
  })

  const preferencesForm = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: user?.preferences.theme ?? "dark",
      rentalReminders: user?.preferences.rentalReminders ?? true,
    },
  })

  useEffect(() => {
    if (!user) {
      return
    }

    profileForm.reset({
      name: user.name,
      phone: user.profile.phone,
      department: user.profile.department,
      studentId: user.profile.studentId,
    })
    preferencesForm.reset({
      theme: user.preferences.theme,
      rentalReminders: user.preferences.rentalReminders,
    })
  }, [preferencesForm, profileForm, user])

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, values)
      toast.success("Profile updated")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  })

  const onPreferencesSubmit = preferencesForm.handleSubmit(async (values) => {
    if (!user) return
    setSaving(true)
    try {
      const permission = await ensureReminderPermission(values.rentalReminders)
      if (permission === "denied" && values.rentalReminders) {
        toast.error("Browser notifications are blocked. Enable them to receive reminders.")
      }

      await updateUserPreferences(user.id, values)
      toast.success("Preferences updated")
    } catch (error) {
      toast.error("Failed to update preferences")
    } finally {
      setSaving(false)
    }
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Profile</p>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-white/55">Manage your account settings</p>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.08]">
              <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-medium">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </div>

          <Form {...profileForm}>
            <form onSubmit={onProfileSubmit} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <Field>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </Field>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <Field>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </Field>
                )}
              />
              <FormField
                control={profileForm.control}
                name="department"
                render={({ field }) => (
                  <Field>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </Field>
                )}
              />
              <FormField
                control={profileForm.control}
                name="studentId"
                render={({ field }) => (
                  <Field>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </Field>
                )}
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...preferencesForm}>
            <form onSubmit={onPreferencesSubmit} className="space-y-4">
              <FormField
                control={preferencesForm.control}
                name="rentalReminders"
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FormLabel>Rental Reminders</FormLabel>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </FormControl>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get a browser notification 30 minutes before your active rental is due.
                    </p>
                    <FormMessage />
                  </Field>
                )}
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full rounded-2xl"
        onClick={() => navigate("/auth/logout")}
      >
        <LogOutIcon className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
