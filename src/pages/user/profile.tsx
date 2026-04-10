import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useCurrentUser } from "@/stores/auth-store"
import { updateUserProfile, updateUserPreferences } from "@/services/firebase/data-service"
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...preferencesForm}>
            <form onSubmit={onPreferencesSubmit} className="space-y-4">
              <FormField
                control={preferencesForm.control}
                name="theme"
                render={({ field }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FormLabel>Dark Theme</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value === "dark"}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? "dark" : "light")
                          }
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </Field>
                )}
              />
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
    </div>
  )
}
