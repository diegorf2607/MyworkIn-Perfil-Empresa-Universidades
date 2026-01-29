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
import {
  Search,
  Filter,
  Calendar,
  Video,
  Clock,
  Plus,
  Loader2,
  CheckCircle2,
  Mail,
  AlertCircle,
  Link2,
  FileText,
} from "lucide-react"
import {
  getMeetings,
  updateMeeting,
  deleteMeeting,
  updateMeetingOutcome,
  markPostMeetingSent,
  markMeetingProgress,
} from "@/lib/actions/meetings"
import { getAccounts } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"
import { useWorkspace } from "@/lib/context/workspace-context"

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
  contact_name: string | null
  contact_email: string | null
  outcome_changed_at: string | null
  post_meeting_sent_at: string | null
  had_progress: boolean
  progress_at: string | null
  next_step_type: string | null
  next_step_date: string | null
  next_step_responsible: string | null
  follow_up_status: "active" | "cancelled" | "alert_sent" | "resolved"
  meeting_url: string | null
  meeting_doc_url: string | null
  meeting_summary: string | null
}

interface Account {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

const nextStepTypeLabels: Record<string, string> = {
  waiting_response: "Esperando respuesta",
  new_meeting: "Nueva reunión",
  send_proposal: "Envío de propuesta",
  internal_review: "Revisión interna universidad",
  general_follow_up: "Seguimiento general",
}

export default function MeetingsPage() {
  const { country } = useParams<{ country: string }>()
  const { workspace } = useWorkspace()
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
      const [meetingsData, accountsData, teamData] = await Promise.all([
        getMeetings(undefined, workspace), 
        getAccounts(undefined, workspace), 
        getTeamMembers()
      ])
      const countryMeetings = (meetingsData || []).filter((m) => m.country_code === country)
      setMeetings(countryMeetings as Meeting[])
      setAccounts(accountsData || [])
      setTeamMembers(teamData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country, workspace])

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

  const handleOutcomeChange = async (newOutcome: Meeting["outcome"]) => {
    if (!selectedMeeting) return
    try {
      await updateMeetingOutcome(selectedMeeting.id, newOutcome, selectedMeeting.outcome)
      setSelectedMeeting({ ...selectedMeeting, outcome: newOutcome, outcome_changed_at: new Date().toISOString() })
      toast.success("Resultado actualizado")
      loadData()
    } catch (error) {
      toast.error("Error al actualizar resultado")
    }
  }

  const handlePostMeetingSent = async () => {
    if (!selectedMeeting) return
    try {
      await markPostMeetingSent(selectedMeeting.id)
      setSelectedMeeting({ ...selectedMeeting, post_meeting_sent_at: new Date().toISOString() })
      toast.success("Post-reunión marcado como enviado")
      loadData()
    } catch (error) {
      toast.error("Error al marcar post-reunión")
    }
  }

  const handleMarkProgress = async () => {
    if (!selectedMeeting) return
    try {
      await markMeetingProgress(selectedMeeting.id)
      setSelectedMeeting({
        ...selectedMeeting,
        had_progress: true,
        progress_at: new Date().toISOString(),
        follow_up_status: "resolved",
      })
      toast.success("Avance registrado - seguimiento cancelado")
      loadData()
    } catch (error) {
      toast.error("Error al registrar avance")
    }
  }

  const handleSave = async () => {
    if (!selectedMeeting) return

    if (selectedMeeting.meeting_url && !isValidUrl(selectedMeeting.meeting_url)) {
      toast.error("URL de grabación inválida")
      return
    }
    if (selectedMeeting.meeting_doc_url && !isValidUrl(selectedMeeting.meeting_doc_url)) {
      toast.error("URL de documento inválida")
      return
    }

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

  const isValidUrl = (url: string): boolean => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isPastMeeting = (meeting: Meeting): boolean => {
    const meetingDate = new Date(meeting.date_time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return meetingDate < today || meeting.outcome !== "pending"
  }

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

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-8">
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

      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Lista de Reuniones</CardTitle>
          <CardDescription>{filteredMeetings.length} reuniones</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Universidad</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Indicadores</TableHead>
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
                    {meeting.contact_name ? (
                      <div>
                        <p className="font-medium text-sm">{meeting.contact_name}</p>
                        <p className="text-xs text-muted-foreground">{meeting.contact_email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{meeting.kind}</Badge>
                  </TableCell>
                  <TableCell>{getOwnerName(meeting.owner_id)}</TableCell>
                  <TableCell>{getOutcomeBadge(meeting.outcome)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {meeting.post_meeting_sent_at && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          <Mail className="h-3 w-3 mr-1" />
                          Post enviado
                        </Badge>
                      )}
                      {meeting.had_progress && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Avance
                        </Badge>
                      )}
                      {meeting.follow_up_status === "active" &&
                        meeting.outcome !== "pending" &&
                        !meeting.had_progress && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Seguimiento
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMeetings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay reuniones programadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.post_meeting_sent_at && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Mail className="h-3 w-3 mr-1" />
                      Post-reunión enviado
                    </Badge>
                  )}
                  {selectedMeeting.had_progress && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Hubo avance
                    </Badge>
                  )}
                  {selectedMeeting.follow_up_status === "active" && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Seguimiento activo
                    </Badge>
                  )}
                  {selectedMeeting.follow_up_status === "resolved" && (
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      Resuelto
                    </Badge>
                  )}
                </div>

                {selectedMeeting.outcome !== "pending" && (
                  <div className="flex gap-2">
                    {!selectedMeeting.post_meeting_sent_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePostMeetingSent}
                        className="flex-1 bg-transparent"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Marcar post enviado
                      </Button>
                    )}
                    {!selectedMeeting.had_progress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkProgress}
                        className="flex-1 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Respondió
                      </Button>
                    )}
                  </div>
                )}

                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <Label className="text-sm font-medium">Datos del contacto</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nombre</Label>
                      <Input
                        value={selectedMeeting.contact_name || ""}
                        onChange={(e) => setSelectedMeeting({ ...selectedMeeting, contact_name: e.target.value })}
                        placeholder="Nombre del contacto"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Correo</Label>
                      <Input
                        type="email"
                        value={selectedMeeting.contact_email || ""}
                        onChange={(e) => setSelectedMeeting({ ...selectedMeeting, contact_email: e.target.value })}
                        placeholder="correo@universidad.edu"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha y hora</Label>
                  <Input
                    type="datetime-local"
                    value={selectedMeeting.date_time.slice(0, 16)}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, date_time: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      onValueChange={(v) => handleOutcomeChange(v as Meeting["outcome"])}
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
                </div>

                <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <Label className="text-sm font-medium">Próximo paso</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Tipo</Label>
                      <Select
                        value={selectedMeeting.next_step_type || ""}
                        onValueChange={(v) => setSelectedMeeting({ ...selectedMeeting, next_step_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(nextStepTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Responsable</Label>
                      <Select
                        value={selectedMeeting.next_step_responsible || "myworkin"}
                        onValueChange={(v) => setSelectedMeeting({ ...selectedMeeting, next_step_responsible: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="myworkin">MyWorkIn</SelectItem>
                          <SelectItem value="university">Universidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Fecha estimada</Label>
                    <Input
                      type="date"
                      value={selectedMeeting.next_step_date || ""}
                      onChange={(e) => setSelectedMeeting({ ...selectedMeeting, next_step_date: e.target.value })}
                    />
                  </div>
                </div>

                {isPastMeeting(selectedMeeting) && (
                  <div className="border rounded-lg p-4 space-y-3 bg-blue-50/50 border-blue-200">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      Post-reunión
                    </Label>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          Link de grabación
                        </Label>
                        <Input
                          type="url"
                          value={selectedMeeting.meeting_url || ""}
                          onChange={(e) => setSelectedMeeting({ ...selectedMeeting, meeting_url: e.target.value })}
                          placeholder="https://zoom.us/rec/..."
                          className={
                            selectedMeeting.meeting_url && !isValidUrl(selectedMeeting.meeting_url)
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {selectedMeeting.meeting_url && !isValidUrl(selectedMeeting.meeting_url) && (
                          <p className="text-xs text-red-500">URL inválida</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Link de documento (transcript / notas)
                        </Label>
                        <Input
                          type="url"
                          value={selectedMeeting.meeting_doc_url || ""}
                          onChange={(e) => setSelectedMeeting({ ...selectedMeeting, meeting_doc_url: e.target.value })}
                          placeholder="https://docs.google.com/..."
                          className={
                            selectedMeeting.meeting_doc_url && !isValidUrl(selectedMeeting.meeting_doc_url)
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {selectedMeeting.meeting_doc_url && !isValidUrl(selectedMeeting.meeting_doc_url) && (
                          <p className="text-xs text-red-500">URL inválida</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Resumen de reunión (AI)</Label>
                        <Textarea
                          value={selectedMeeting.meeting_summary || ""}
                          onChange={(e) => setSelectedMeeting({ ...selectedMeeting, meeting_summary: e.target.value })}
                          placeholder="Resumen generado por IA o notas manuales..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={selectedMeeting.notes || ""}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, notes: e.target.value })}
                    rows={3}
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
