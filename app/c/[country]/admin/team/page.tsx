"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Trophy, Loader2, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberActive,
} from "@/lib/actions/team"
import { getCountries } from "@/lib/actions/countries"
import { getAccounts } from "@/lib/actions/accounts"
import { getOpportunities } from "@/lib/actions/opportunities"
import { getMeetings } from "@/lib/actions/meetings"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "SDR" | "AE"
  is_active?: boolean
  country_codes: string[]
}

interface Country {
  code: string
  name: string
  active: boolean
}

export default function TeamPage() {
  const { country } = useParams<{ country: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "SDR" as "SDR" | "AE",
    country_codes: [] as string[],
  })

  const loadData = useCallback(async () => {
    try {
      const [membersData, countriesData, accountsData, oppsData, meetingsData] = await Promise.all([
        getTeamMembers(),
        getCountries(),
        getAccounts(),
        getOpportunities(),
        getMeetings(),
      ])
      setTeamMembers(membersData || [])
      setCountries((countriesData || []).filter((c) => c.active))
      setAccounts(accountsData || [])
      setOpportunities(oppsData || [])
      setMeetings(meetingsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculate stats per team member
  const getTeamMemberStats = (memberId: string) => {
    const memberAccounts = accounts.filter((a) => a.owner_id === memberId)
    const memberOpps = opportunities.filter((o) => memberAccounts.some((a) => a.id === o.account_id))
    const memberMeetings = meetings.filter((m) => m.owner_id === memberId)

    const sqls = memberAccounts.filter((a) => ["sql", "opp", "won"].includes(a.stage)).length
    const opps = memberAccounts.filter((a) => ["opp", "won"].includes(a.stage)).length
    const won = memberOpps.filter((o) => o.stage === "won").length
    const totalOpps = memberOpps.filter((o) => ["won", "lost"].includes(o.stage)).length
    const winRate = totalOpps > 0 ? Math.round((won / totalOpps) * 100) : 0
    const mrr = memberOpps.filter((o) => o.stage === "won").reduce((sum, o) => sum + Number(o.mrr || 0), 0)
    const meetingsDone = memberMeetings.filter((m) => m.outcome === "done").length

    return { sqls, opps, meetingsDone, winRate, mrr }
  }

  const toggleCountrySelection = (code: string, isEditing: boolean) => {
    if (isEditing && editingMember) {
      const current = editingMember.country_codes || []
      const updated = current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
      setEditingMember({ ...editingMember, country_codes: updated })
    } else {
      const current = newMember.country_codes
      const updated = current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
      setNewMember({ ...newMember, country_codes: updated })
    }
  }

  const handleCreateMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Completa nombre y email")
      return
    }
    if (newMember.country_codes.length === 0) {
      toast.error("Selecciona al menos un país")
      return
    }

    startTransition(async () => {
      try {
        await createTeamMember(newMember)
        setNewMember({ name: "", email: "", role: "SDR", country_codes: [] })
        setIsNewDialogOpen(false)
        toast.success("Miembro agregado")
        loadData()
      } catch (error) {
        toast.error("Error al crear miembro")
      }
    })
  }

  const handleUpdateMember = () => {
    if (!editingMember) return
    if (editingMember.country_codes.length === 0) {
      toast.error("Selecciona al menos un país")
      return
    }

    startTransition(async () => {
      try {
        await updateTeamMember(editingMember)
        setEditingMember(null)
        toast.success("Miembro actualizado")
        loadData()
      } catch (error) {
        toast.error("Error al actualizar")
      }
    })
  }

  const handleDeleteMember = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTeamMember(id)
        toast.success("Miembro eliminado")
        loadData()
      } catch (error) {
        toast.error("Error al eliminar")
      }
    })
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleTeamMemberActive(id, !currentActive)
        toast.success(currentActive ? "Miembro desactivado" : "Miembro activado")
        loadData()
      } catch (error) {
        toast.error("Error al cambiar estado")
      }
    })
  }

  // Filter and sort members
  const filteredMembers = teamMembers
    .filter((m) => showInactive || m.is_active !== false)
    .sort((a, b) => {
      const statsA = getTeamMemberStats(a.id)
      const statsB = getTeamMemberStats(b.id)
      return statsB.mrr - statsA.mrr
    })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipo Comercial</h1>
          <p className="text-muted-foreground">Leaderboard y gestión del equipo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
            <Label htmlFor="show-inactive" className="text-sm">
              Mostrar inactivos
            </Label>
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
                  <Label>Nombre *</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
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
                <div className="space-y-2">
                  <Label>Países asignados *</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {countries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay países activos configurados</p>
                    ) : (
                      countries.map((c) => (
                        <div key={c.code} className="flex items-center gap-2">
                          <Checkbox
                            id={`new-${c.code}`}
                            checked={newMember.country_codes.includes(c.code)}
                            onCheckedChange={() => toggleCountrySelection(c.code, false)}
                          />
                          <Label htmlFor={`new-${c.code}`} className="flex items-center gap-2 cursor-pointer">
                            <Badge variant="outline">{c.code}</Badge>
                            {c.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  {newMember.country_codes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newMember.country_codes.map((code) => (
                        <Badge key={code} variant="secondary">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateMember} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.slice(0, 3).map((member, idx) => {
          const stats = getTeamMemberStats(member.id)
          return (
            <Card
              key={member.id}
              className={`${idx === 0 ? "border-yellow-300 bg-yellow-50/50" : ""} ${member.is_active === false ? "opacity-50" : ""}`}
            >
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
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === "AE" ? "default" : "secondary"}>{member.role}</Badge>
                        {member.is_active === false && <Badge variant="outline">Inactivo</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Show countries */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {(member.country_codes || []).map((code) => (
                    <Badge key={code} variant="outline" className="text-xs">
                      {code}
                    </Badge>
                  ))}
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
          <CardDescription>{filteredMembers.length} miembros del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Países</TableHead>
                <TableHead>SQLs</TableHead>
                <TableHead>Opps</TableHead>
                <TableHead>Reuniones</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const stats = getTeamMemberStats(member.id)
                return (
                  <TableRow key={member.id} className={member.is_active === false ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "AE" ? "default" : "secondary"}>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(member.country_codes || []).map((code) => (
                          <Badge key={code} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                        {(!member.country_codes || member.country_codes.length === 0) && (
                          <span className="text-muted-foreground text-xs">Sin asignar</span>
                        )}
                      </div>
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
                      {member.is_active !== false ? (
                        <Badge className="bg-green-600">Activo</Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </TableCell>
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
                          className="h-8 w-8"
                          onClick={() => handleToggleActive(member.id, member.is_active !== false)}
                        >
                          {member.is_active !== false ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
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
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No hay miembros del equipo
                  </TableCell>
                </TableRow>
              )}
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
            <div className="space-y-2">
              <Label>Países asignados *</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {countries.map((c) => (
                  <div key={c.code} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-${c.code}`}
                      checked={(editingMember?.country_codes || []).includes(c.code)}
                      onCheckedChange={() => toggleCountrySelection(c.code, true)}
                    />
                    <Label htmlFor={`edit-${c.code}`} className="flex items-center gap-2 cursor-pointer">
                      <Badge variant="outline">{c.code}</Badge>
                      {c.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMember} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
