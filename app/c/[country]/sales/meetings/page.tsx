"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { CreateMeetingDialog } from "@/components/crm/create-meeting-dialog"
import { Search, Filter, Calendar, Video, Clock, Plus, Loader2 } from "lucide-react"
import { getMeetings, updateMeeting, deleteMeeting } from "@/lib/actions/meetings"
import { getAccounts } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"

interface Meeting {
  id: string
  country_code: string
  account_id: string
  owner_id: string | null
  kind: "Discovery" | "Demo" | "Propuesta" | "Kickoff"
  date_time: string
  outcome: "pending" | "done" | "no-show" | "next-step"
  notes: string | null
  next_step: string | null
  next_meeting_date: string | null
}

interface Account {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

export default function MeetingsPage() {
  const { country } = useParams<{ country: string }>()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterKind, setFilterKind] = useState<string>("all")
  const [filterOutcome, setFilterOutcome] = useState<string>("all")

  const loadData = useCallback(async () => {
    try {
      const [meetingsData, accountsData, teamData] = await Promise.all([getMeetings(), getAccounts(), getTeamMembers()])
      const countryMeetings = (meetingsData || []).filter((m) => m.country_code === country)
      setMeetings(countryMeetings as Meeting[])
      setAccounts(accountsData || [])
      setTeamMembers(teamData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings]

    if (searchQuery) {
      filtered = filtered.filter((m) => {
        const account = accounts.find((a) => a.id === m.account_id)
        return account?.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    if (filterKind !== "all") {
      filtered = filtered.filter((m) => m.kind === filterKind)
    }

    if (filterOutcome !== "all") {
      filtered = filtered.filter((m) => m.outcome === filterOutcome)
    }

    return filtered.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  }, [meetings, searchQuery, filterKind, filterOutcome, accounts])

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Sin asignar"
  }

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === ownerId)
    return member?.name || "Sin asignar"
  }

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "done":
        return <Badge className="bg-green-600">Completada</Badge>
      case "no-show":
        return <Badge variant="destructive">No-show</Badge>
      case "next-step":
        return <Badge className="bg-blue-600">Next step</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  const handleSave = async () => {
    if (!selectedMeeting) return
    try {
      await updateMeeting(selectedMeeting)
      toast.success("Reunión actualizada")
      setSheetOpen(false)
      loadData()
    } catch (error) {
      toast.error("Error al actualizar")
    }
  }

  const handleDelete = async () => {
    if (!selectedMeeting) return
    try {
      await deleteMeeting(selectedMeeting.id)
      toast.success("Reunión eliminada")
      setSheetOpen(false)
      setSelectedMeeting(null)
      loadData()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const pendingCount = filteredMeetings.filter((m) => m.outcome === "pending").length
  const thisWeekCount = filteredMeetings.filter((m) => {
    const meetingDate = new Date(m.date_time)
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return meetingDate >= today && meetingDate <= weekFromNow
  }).length

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
          <h1 className="text-2xl font-bold">Reuniones</h1>
          <p className="text-muted-foreground">Gestión de reuniones comerciales</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-lg font-bold">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Esta semana</p>
                <p className="text-lg font-bold">{thisWeekCount}</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agendar Reunión
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por universidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterKind} onValueChange={setFilterKind}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Discovery">Discovery</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
              <SelectItem value="Propuesta">Propuesta</SelectItem>
              <SelectItem value="Kickoff">Kickoff</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={setFilterOutcome}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="done">Completada</SelectItem>
              <SelectItem value="no-show">No-show</SelectItem>
              <SelectItem value="next-step">Next step</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reuniones</CardTitle>
          <CardDescription>{filteredMeetings.length} reuniones</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Universidad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow
                  key={meeting.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedMeeting(meeting)
                    setSheetOpen(true)
                  }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(meeting.date_time).toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.date_time).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getAccountName(meeting.account_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{meeting.kind}</Badge>
                  </TableCell>
                  <TableCell>{getOwnerName(meeting.owner_id)}</TableCell>
                  <TableCell>{getOutcomeBadge(meeting.outcome)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{meeting.notes || "-"}</TableCell>
                </TableRow>
              ))}
              {filteredMeetings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay reuniones programadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Meeting Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedMeeting?.kind} - {getAccountName(selectedMeeting?.account_id || "")}
              </SheetTitle>
            </SheetHeader>

            {selectedMeeting && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Fecha y hora</Label>
                  <Input
                    type="datetime-local"
                    value={selectedMeeting.date_time.slice(0, 16)}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, date_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de reunión</Label>
                  <Select
                    value={selectedMeeting.kind}
                    onValueChange={(v) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        kind: v as Meeting["kind"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discovery">Discovery</SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Propuesta">Propuesta</SelectItem>
                      <SelectItem value="Kickoff">Kickoff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resultado</Label>
                  <Select
                    value={selectedMeeting.outcome}
                    onValueChange={(v) =>
                      setSelectedMeeting({
                        ...selectedMeeting,
                        outcome: v as Meeting["outcome"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="done">Completada</SelectItem>
                      <SelectItem value="no-show">No-show</SelectItem>
                      <SelectItem value="next-step">Next step</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={selectedMeeting.notes || ""}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Próximo paso</Label>
                  <Input
                    value={selectedMeeting.next_step || ""}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, next_step: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Eliminar
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreateMeetingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        countryCode={country}
        onSuccess={loadData}
      />
    </div>
  )
}
