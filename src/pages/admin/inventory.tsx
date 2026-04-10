import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil } from "lucide-react"

import { subscribePowerbanks, savePowerbank } from "@/services/firebase/data-service"
import { powerbankSchema, type PowerbankValues } from "@/schemas/forms"
import type { Powerbank } from "@/types/models"
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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  available: "default",
  rented: "secondary",
  maintenance: "destructive",
  offline: "secondary",
}

export function InventoryPage() {
  const [powerbanks, setPowerbanks] = useState<Powerbank[]>([])
  const [editing, setEditing] = useState<Powerbank | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = subscribePowerbanks(setPowerbanks)
    return () => unsub()
  }, [])

  const form = useForm<PowerbankValues>({
    resolver: zodResolver(powerbankSchema),
    defaultValues: {
      label: "",
      qrCode: "",
      rfidTagId: "",
      location: "",
      deviceAuthUid: "",
      status: "available",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true)
    try {
      await savePowerbank(values, editing)
      toast.success(editing ? "Powerbank updated" : "Powerbank created")
      setOpen(false)
      setEditing(null)
      form.reset()
    } catch (error) {
      toast.error("Failed to save powerbank")
    } finally {
      setSaving(false)
    }
  })

  const handleEdit = (powerbank: Powerbank) => {
    setEditing(powerbank)
    form.reset({
      label: powerbank.label,
      qrCode: powerbank.qrCode,
      rfidTagId: powerbank.rfidTagId,
      location: powerbank.location,
      deviceAuthUid: powerbank.deviceAuthUid ?? "",
      status: powerbank.status,
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setEditing(null)
    form.reset({
      label: "",
      qrCode: "",
      rfidTagId: "",
      location: "",
      deviceAuthUid: "",
      status: "available",
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage powerbank devices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Powerbank
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Powerbank" : "Add Powerbank"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update powerbank details"
                  : "Add a new powerbank to the inventory"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qrCode"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>QR Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rfidTagId"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>RFID Tag ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deviceAuthUid"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>Device Auth UID (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Field>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          {...field}
                        >
                          <option value="available">Available</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="offline">Offline</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Powerbanks</CardTitle>
          <CardDescription>
            {powerbanks.length} device{powerbanks.length !== 1 ? "s" : ""} in inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {powerbanks.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No powerbanks yet. Add one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerbanks.map((powerbank) => (
                  <TableRow key={powerbank.id}>
                    <TableCell className="font-medium">{powerbank.label}</TableCell>
                    <TableCell>{powerbank.location}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {powerbank.qrCode}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[powerbank.status]}>
                        {powerbank.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(powerbank)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
