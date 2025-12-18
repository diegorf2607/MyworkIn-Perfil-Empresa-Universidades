"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Trophy } from "lucide-react"
import { toast } from "sonner"

interface TeamPageProps {
  params: Promise<{ country: string }>
}

export default function TeamPage() {
  const { country } = useParams<{ country: string }>()
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, accounts, opportunities, meetings } =
    useAppStore()

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<(typeof teamMembers)[0] | null>(null)
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "SDR" as "SDR" | "AE" })

  // Calculate stats per team member
  const getTeamMemberStats = (memberId: string) => {
    const memberAccounts = accounts.filter((a) => a.ownerId === memberId && a.countryCode === country)
    const memberOpps = opportunities.filter(
      (o) => o.countryCode === country && memberAccounts.some((a) => a.id === o.accountId),
    )
    const memberMeetings = meetings.filter((m) => m.ownerId === memberId && m.countryCode === country)

    const sqls = memberAccounts.filter((a) => ["sql", "opp", "won"].includes(a.stage)).length
    const opps = memberAccounts.filter((a) => ["opp", "won"].includes(a.stage)).length
    const won = memberOpps.filter((o) => o.stage === "won").length
    const totalOpps = memberOpps.filter((o) => ["won", "lost"].includes(o.stage)).length
    const winRate = totalOpps > 0 ? Math.round((won / totalOpps) * 100) : 0
    const mrr = memberOpps.filter((o) => o.stage === "won").reduce((sum, o) => sum + o.mrr, 0)
    const meetingsDone = memberMeetings.filter((m) => m.outcome === "done").length

    return { sqls, opps, meetingsDone, winRate, mrr }
  }

  const handleCreateMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Completa todos los campos")
      return
    }
    addTeamMember({
      id: Math.random().toString(36).substring(2, 11),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
    })
    setNewMember({ name: "", email: "", role: "SDR" })
    setIsNewDialogOpen(false)
    toast.success("Miembro agregado")
  }

  const handleUpdateMember = () => {
    if (!editingMember) return
    updateTeamMember(editingMember.id, editingMember)
    setEditingMember(null)
    toast.success("Miembro actualizado")
  }

  const handleDeleteMember = (id: string) => {
    deleteTeamMember(id)
    toast.success("Miembro eliminado")
  }

  // Sort by MRR for leaderboard
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const statsA = getTeamMemberStats(a.id)
    const statsB = getTeamMemberStats(b.id)
    return statsB.mrr - statsA.mrr
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipo Comercial</h1>
          <p className="text-muted-foreground">Leaderboard y gestión del equipo</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo miembro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="juan@myworkin.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(v) => setNewMember({ ...newMember, role: v as "SDR" | "AE" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SDR">SDR</SelectItem>
                    <SelectItem value="AE">AE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMember}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedMembers.slice(0, 3).map((member, idx) => {
          const stats = getTeamMemberStats(member.id)
          return (
            <Card key={member.id} className={idx === 0 ? "border-yellow-300 bg-yellow-50/50" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        idx === 0 ? "bg-yellow-100" : idx === 1 ? "bg-gray-100" : "bg-orange-100"
                      }`}
                    >
                      {idx === 0 ? (
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <span className="text-xl font-bold text-muted-foreground">#{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <Badge variant={member.role === "AE" ? "default" : "secondary"}>{member.role}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">MRR</p>
                    <p className="font-semibold text-green-600">${stats.mrr.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold">{stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SQLs</p>
                    <p className="font-semibold">{stats.sqls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reuniones</p>
                    <p className="font-semibold">{stats.meetingsDone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los miembros</CardTitle>
          <CardDescription>{teamMembers.length} miembros del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>SQLs</TableHead>
                <TableHead>Opps</TableHead>
                <TableHead>Reuniones</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => {
                const stats = getTeamMemberStats(member.id)
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "AE" ? "default" : "secondary"}>{member.role}</Badge>
                    </TableCell>
                    <TableCell>{stats.sqls}</TableCell>
                    <TableCell>{stats.opps}</TableCell>
                    <TableCell>{stats.meetingsDone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={stats.winRate >= 30 ? "default" : "secondary"}
                        className={stats.winRate >= 30 ? "bg-green-600" : ""}
                      >
                        {stats.winRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">${stats.mrr.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingMember(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar miembro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={editingMember?.name || ""}
                onChange={(e) => setEditingMember((prev) => (prev ? { ...prev, name: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingMember?.email || ""}
                onChange={(e) => setEditingMember((prev) => (prev ? { ...prev, email: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={editingMember?.role || "SDR"}
                onValueChange={(v) => setEditingMember((prev) => (prev ? { ...prev, role: v as "SDR" | "AE" } : null))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SDR">SDR</SelectItem>
                  <SelectItem value="AE">AE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMember}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
