import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Pencil, Plus, ScanLine, Save } from "lucide-react"

import { useInventoryStore } from "@/stores/inventory-store"
import { useIsOnline } from "@/stores/ui-store"
import { saveTag } from "@/services/firebase/data-service"
import { rfidTagSchema, type RfidTagValues } from "@/schemas/forms"
import type { RfidTag } from "@/types/models"
import {
  generateRfidTagCode,
  normalizeRfidTagCode,
  supportsWebNfc,
  writeNfcTagCode,
} from "@/utils/nfc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormLabel, FormMessage, Field } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TagsPage() {
  const tags = useInventoryStore((state) => state.tags)
  const powerbanks = useInventoryStore((state) => state.powerbanks)
  const loading = useInventoryStore((state) => state.loading)
  const subscribeInventory = useInventoryStore((state) => state.subscribe)
  const isOnline = useIsOnline()
  const [editing, setEditing] = useState<RfidTag | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [writing, setWriting] = useState(false)
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const webNfcSupported = supportsWebNfc()

  useEffect(() => {
    const unsubscribe = subscribeInventory()
    return () => {
      unsubscribe()
    }
  }, [subscribeInventory])

  const form = useForm<RfidTagValues>({
    resolver: zodResolver(rfidTagSchema),
    defaultValues: {
      code: "",
      name: "",
      notes: "",
      powerbankId: "",
      status: "active",
    },
  })

  const filteredTags = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    return tags.filter((tag) => {
      const powerbank = powerbanks.find((item) => item.id === tag.powerbankId)
      return !normalized ||
        tag.name.toLowerCase().includes(normalized) ||
        tag.code.toLowerCase().includes(normalized) ||
        tag.notes.toLowerCase().includes(normalized) ||
        powerbank?.label.toLowerCase().includes(normalized)
    })
  }, [deferredQuery, powerbanks, tags])

  const handleCreate = () => {
    setEditing(null)
    form.reset({ code: "", name: "", notes: "", powerbankId: "", status: "active" })
    setOpen(true)
  }

  const handleEdit = (tag: RfidTag) => {
    setEditing(tag)
    form.reset({ code: tag.code, name: tag.name, notes: tag.notes, powerbankId: tag.powerbankId ?? "", status: tag.status })
    setOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!isOnline) return toast.error("Reconnect to save tag updates.")
    setSaving(true)
    try {
      await saveTag({ ...values, code: normalizeRfidTagCode(values.code) }, editing)
      toast.success(editing ? "Tag updated" : "Tag created")
      setOpen(false)
      setEditing(null)
    } catch {
      toast.error("Failed to save tag")
    } finally {
      setSaving(false)
    }
  })

  const handleNormalize = () => {
    const normalized = normalizeRfidTagCode(form.getValues("code"))
    form.setValue("code", normalized, { shouldDirty: true, shouldValidate: true })
  }

  const handleWriteAndRegister = async () => {
    if (!isOnline) {
      toast.error("Reconnect to register a tag.")
      return
    }

    if (!webNfcSupported) {
      toast.error("Web NFC write requires Chrome on Android with NFC enabled.")
      return
    }

    const fieldsValid = await form.trigger(["name", "powerbankId", "notes", "status"])
    if (!fieldsValid) {
      toast.error("Complete the tag details before writing to the tag.")
      return
    }

    setWriting(true)
    try {
      const currentValues = form.getValues()
      const code = normalizeRfidTagCode(currentValues.code) || generateRfidTagCode()
      const writtenCode = await writeNfcTagCode(code)

      form.setValue("code", writtenCode, { shouldDirty: true, shouldValidate: true })

      await saveTag(
        {
          ...currentValues,
          code: writtenCode,
        },
        editing
      )

      toast.success(editing ? "Tag rewritten and updated" : "Tag written and registered")
      setOpen(false)
      setEditing(null)
      form.reset({ code: "", name: "", notes: "", powerbankId: "", status: "active" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to write and register tag"
      toast.error(message)
    } finally {
      setWriting(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tags</h1>
          <p className="mt-2 text-white/55">Manage RFID tags using the physical UID read by the ESP32 hardware.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} disabled={!isOnline}><Plus className="mr-2 size-4" />Add Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Tag" : "Add Tag"}</DialogTitle>
              <DialogDescription>
                Customize tag identity, write a website-managed NFC payload to the tag,
                and link it to a powerbank so it is ready to use.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => <Field><FormLabel>Tag Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></Field>} />
                <FormField control={form.control} name="code" render={({ field }) => <Field><FormLabel>Tag Code</FormLabel><FormControl><Input {...field} placeholder="Example: 04A1B2C3D4 or SUNSAVER:TAG:ABC123" /></FormControl><p className="mt-2 text-sm text-white/50">For hardware UID tags, enter the MFRC522 UID from the ESP32 log. For Android phone registration, use Write Tag & Register to write a managed NFC payload and save the same code automatically.</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={handleNormalize}>Normalize Code</Button><Button type="button" variant="outline" onClick={handleWriteAndRegister} disabled={writing || saving || !isOnline || !webNfcSupported}><ScanLine className="mr-2 size-4" />{writing ? "Writing Tag..." : editing ? "Rewrite Tag & Update" : "Write Tag & Register"}</Button></div>{!webNfcSupported && <p className="mt-2 text-sm text-amber-300/80">Phone NFC write is available only on supported Android Chrome browsers over HTTPS.</p>}<FormMessage /></Field>} />
                <FormField control={form.control} name="powerbankId" render={({ field }) => <Field><FormLabel>Linked Powerbank</FormLabel><FormControl><Select value={field.value || "unassigned"} onValueChange={(value) => field.onChange(value === "unassigned" ? "" : value)}><SelectTrigger className="w-full"><SelectValue placeholder="Unassigned" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{powerbanks.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></FormControl><FormMessage /></Field>} />
                <FormField control={form.control} name="notes" render={({ field }) => <Field><FormLabel>Notes</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></Field>} />
                <FormField control={form.control} name="status" render={({ field }) => <Field><FormLabel>Status</FormLabel><FormControl><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select></FormControl><FormMessage /></Field>} />
                <Button type="submit" className="w-full" disabled={saving || writing || !isOnline}><Save className="mr-2 size-4" />{saving ? "Saving..." : "Save Tag Only"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>Registered Tags</CardTitle>
          <CardDescription>{tags.length} tag{tags.length !== 1 ? "s" : ""} in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4"><Input placeholder="Search by tag name, code, notes, or linked powerbank" value={query} onChange={(event) => startTransition(() => setQuery(event.target.value))} /></div>
          {loading ? <p className="py-8 text-center text-white/50">Loading tags...</p> : filteredTags.length === 0 ? <p className="py-8 text-center text-white/50">No tags found.</p> : (
            <Table className="text-white">
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Linked Powerbank</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{filteredTags.map((tag) => <TableRow key={tag.id}><TableCell className="font-medium">{tag.name}</TableCell><TableCell className="font-mono text-sm">{tag.code}</TableCell><TableCell>{powerbanks.find((item) => item.id === tag.powerbankId)?.label ?? "Unassigned"}</TableCell><TableCell><Badge variant={tag.status === "active" ? "default" : "secondary"}>{tag.status}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}><Pencil className="size-4" /></Button></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
