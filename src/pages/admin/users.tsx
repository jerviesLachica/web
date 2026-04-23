import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { subscribeUsers, updateManagedUserStatus } from "@/services/firebase/data-service"
import type { AppUser, UserStatus } from "@/types/models"
import { useIsOnline } from "@/stores/ui-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const isOnline = useIsOnline()

  useEffect(() => {
    const unsub = subscribeUsers(setUsers)
    return () => unsub()
  }, [])

  const handleToggleStatus = async (user: AppUser) => {
    if (!isOnline) {
      toast.error("Reconnect to manage users.")
      return
    }

    const newStatus: UserStatus = user.status === "active" ? "disabled" : "active"
    try {
      await updateManagedUserStatus(user.id, newStatus)
      toast.success(`User ${newStatus === "active" ? "enabled" : "disabled"}`)
    } catch {
      toast.error("Failed to update user status")
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return users.filter((user) => {
      return (
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.profile.department.toLowerCase().includes(normalizedQuery) ||
        user.profile.studentId.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [deferredQuery, users])

  return (
    <div className="space-y-6 text-white">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-white/55">Manage registered users</p>
      </div>

      <Card className="bg-white/[0.04]">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name, email, department, or student ID"
              value={query}
              onChange={(event) => {
                const value = event.target.value
                startTransition(() => setQuery(value))
              }}
            />
          </div>
          {filteredUsers.length === 0 ? (
            <p className="py-8 text-center text-white/50">
              {users.length === 0
                ? "No users registered yet."
                : "No users match the current search."}
            </p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "active" ? "default" : "destructive"}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.emailVerified ? "default" : "outline"}
                      >
                        {user.emailVerified ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!isOnline}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === "active" ? "Disable" : "Enable"}
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
