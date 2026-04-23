import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Pencil } from "lucide-react"

import { savePowerbank } from "@/services/firebase/data-service"
import { powerbankSchema, type PowerbankValues } from "@/schemas/forms"
import type { Powerbank } from "@/types/models"
import { useInventoryStore } from "@/stores/inventory-store"
import { useIsOnline } from "@/stores/ui-store"
import { formatDateTime } from "@/utils/date"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  available: "default",
  rented: "secondary",
  cooldown: "secondary",
  maintenance: "destructive",
  offline: "secondary",
}

export function InventoryPage() {
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const loading = useInventoryStore((state) => state.loading)
  const subscribeInventory = useInventoryStore((state) => state.subscribe)
  const isOnline = useIsOnline()
  const [editing, setEditing] = useState<Powerbank | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Powerbank["status"] | "all">("all")
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    const unsubscribe = subscribeInventory()
    return () => {
      unsubscribe()
    }
  }, [subscribeInventory])

  const form = useForm<PowerbankValues>({
    resolver: zodResolver(powerbankSchema),
    defaultValues: {
      label: "",
      location: "",
      deviceAuthUid: "",
      status: "available",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isOnline) {
      toast.error("Reconnect to save inventory updates.")
      return
    }

    setSaving(true)
    try {
      await savePowerbank(values, editing)
      toast.success(editing ? "Powerbank updated" : "Powerbank created")
      setOpen(false)
      setEditing(null)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save powerbank")
    } finally {
      setSaving(false)
    }
  })

  const filteredPowerbanks = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return powerbanks.filter((powerbank) => {
      const matchesQuery =
        !normalizedQuery ||
        powerbank.label.toLowerCase().includes(normalizedQuery) ||
        powerbank.location.toLowerCase().includes(normalizedQuery)

      const matchesStatus =
        statusFilter === "all" ? true : powerbank.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [deferredQuery, powerbanks, statusFilter])

  const handleEdit = (powerbank: Powerbank) => {
    setEditing(powerbank)
    form.reset({
      label: powerbank.label,
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
      location: "",
      deviceAuthUid: "",
      status: "available",
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="mt-2 text-white/55">Manage powerbank devices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} disabled={!isOnline}>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!isOnline || saving}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                           <SelectItem value="available">Available</SelectItem>
                           <SelectItem value="rented">Rented</SelectItem>
                           <SelectItem value="cooldown">Cooldown</SelectItem>
                           <SelectItem value="maintenance">Maintenance</SelectItem>
                           <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </Field>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={saving || !isOnline}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Powerbanks</CardTitle>
          <CardDescription>
            {powerbanks.length} device{powerbanks.length !== 1 ? "s" : ""} in inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
            <Input
              placeholder="Search by label or location"
              value={query}
              onChange={(event) => {
                const value = event.target.value
                startTransition(() => setQuery(value))
              }}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as Powerbank["status"] | "all")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All statuses</SelectItem>
                 <SelectItem value="available">Available</SelectItem>
                 <SelectItem value="rented">Rented</SelectItem>
                 <SelectItem value="cooldown">Cooldown</SelectItem>
                 <SelectItem value="maintenance">Maintenance</SelectItem>
                 <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <p className="py-8 text-center text-white/50">Loading powerbanks...</p>
          ) : filteredPowerbanks.length === 0 ? (
            <p className="py-8 text-center text-white/50">
              {powerbanks.length === 0
                ? "No powerbanks yet. Add one to get started."
                : "No powerbanks match the current filters."}
            </p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cooldown Ends</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPowerbanks.map((powerbank) => (
                  <TableRow key={powerbank.id}>
                    <TableCell className="font-medium">{powerbank.label}</TableCell>
                    <TableCell>{powerbank.location}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[powerbank.status]}>
                        {powerbank.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {powerbank.cooldownEndsAt
                        ? formatDateTime(powerbank.cooldownEndsAt)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!isOnline}
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
