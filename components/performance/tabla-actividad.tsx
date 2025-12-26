"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ExternalLink, Clock, FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface ActivityLogItem {
  id: string
  usuario: string
  usuarioId: string
  rol: string
  tipoAccion: string
  entidad: string
  entidadTipo: string
  entidadId?: string
  canal: string
  fechaHora: string
  metadata?: {
    subject?: string
    summary?: string
  }
}

interface TablaActividadComercialProps {
  data: ActivityLogItem[]
  loading?: boolean
  teamMembers?: Array<{ id: string; name: string; role: string }>
  onExportCSV?: () => void
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  universidad: "bg-blue-100 text-blue-800",
  lead: "bg-emerald-100 text-emerald-800",
  sql: "bg-amber-100 text-amber-800",
  oportunidad: "bg-purple-100 text-purple-800",
  deal: "bg-green-100 text-green-800",
  kdm: "bg-pink-100 text-pink-800",
  otro: "bg-gray-100 text-gray-800",
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  correo_enviado: "Correo enviado",
  respuesta_recibida: "Respuesta",
  llamada: "Llamada",
  reunion_agendada: "Reunión agendada",
  reunion_completada: "Reunión completada",
  crear_universidad: "Nueva universidad",
  crear_lead: "Nuevo lead",
  crear_kdm: "Nuevo KDM",
  deal_creado: "Deal creado",
  deal_ganado: "Deal ganado",
  follow_up: "Follow-up",
  nota: "Nota",
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  correo_enviado: "bg-blue-100 text-blue-800",
  respuesta_recibida: "bg-emerald-100 text-emerald-800",
  llamada: "bg-amber-100 text-amber-800",
  reunion_agendada: "bg-purple-100 text-purple-800",
  reunion_completada: "bg-green-100 text-green-800",
  crear_universidad: "bg-cyan-100 text-cyan-800",
  crear_lead: "bg-teal-100 text-teal-800",
  crear_kdm: "bg-pink-100 text-pink-800",
  deal_creado: "bg-orange-100 text-orange-800",
  deal_ganado: "bg-green-100 text-green-800",
  follow_up: "bg-indigo-100 text-indigo-800",
  nota: "bg-gray-100 text-gray-800",
}

export function TablaActividadComercial({
  data,
  loading = false,
  teamMembers = [],
  onExportCSV,
}: TablaActividadComercialProps) {
  const [search, setSearch] = useState("")
  const [filterUsuario, setFilterUsuario] = useState<string>("todos")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const tiposAccion = Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.entidad.toLowerCase().includes(search.toLowerCase()) ||
      item.usuario.toLowerCase().includes(search.toLowerCase())
    const matchesUsuario = filterUsuario === "todos" || item.usuarioId === filterUsuario
    const matchesRol = filterRol === "todos" || item.rol === filterRol
    const matchesTipo = filterTipo === "todos" || item.tipoAccion === filterTipo
    return matchesSearch && matchesUsuario && matchesRol && matchesTipo
  })

  const handleRowClick = (activity: ActivityLogItem) => {
    setSelectedActivity(activity)
    setSheetOpen(true)
  }

  const formatFechaHora = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM, HH:mm", { locale: es })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-36" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Log de Actividad</CardTitle>
              <CardDescription>Registro cronológico de todas las acciones comerciales</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit">
                {filteredData.length} actividades
              </Badge>
              {onExportCSV && (
                <Button variant="outline" size="sm" onClick={onExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por entidad o usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterUsuario} onValueChange={setFilterUsuario}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los usuarios</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="SDR">SDR</SelectItem>
                <SelectItem value="AE">AE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las acciones</SelectItem>
                {tiposAccion.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No se encontraron actividades
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(activity)}
                    >
                      <TableCell>
                        <div>
                          <span className="font-medium">{activity.usuario}</span>
                          <Badge variant={activity.rol === "SDR" ? "default" : "secondary"} className="ml-2 text-xs">
                            {activity.rol}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ACTION_TYPE_COLORS[activity.tipoAccion] || "bg-gray-100 text-gray-800"}>
                          {ACTION_TYPE_LABELS[activity.tipoAccion] || activity.tipoAccion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="max-w-[180px] truncate">{activity.entidad}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${ENTITY_TYPE_COLORS[activity.entidadTipo] || ""}`}
                          >
                            {activity.entidadTipo}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {activity.canal}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatFechaHora(activity.fechaHora)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver entidad">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md p-0">
          <div className="p-6 space-y-6">
            <SheetHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle>Detalle de actividad</SheetTitle>
                {selectedActivity?.entidadId && (
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <ExternalLink className="h-3 w-3" />
                    Ver entidad
                  </Button>
                )}
              </div>
            </SheetHeader>

            {selectedActivity && (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Usuario</p>
                    <p className="font-medium">{selectedActivity.usuario}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Rol</p>
                    <Badge variant={selectedActivity.rol === "SDR" ? "default" : "secondary"}>
                      {selectedActivity.rol}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Acción</p>
                    <Badge className={ACTION_TYPE_COLORS[selectedActivity.tipoAccion] || ""}>
                      {ACTION_TYPE_LABELS[selectedActivity.tipoAccion] || selectedActivity.tipoAccion}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Fecha/Hora</p>
                    <p className="font-medium">{formatFechaHora(selectedActivity.fechaHora)}</p>
                  </div>
                </div>

                {/* Entidad relacionada */}
                <div className="p-4 rounded-lg border space-y-2">
                  <p className="text-xs text-muted-foreground">Entidad relacionada</p>
                  <p className="font-medium text-lg">{selectedActivity.entidad}</p>
                  <Badge variant="outline" className={ENTITY_TYPE_COLORS[selectedActivity.entidadTipo] || ""}>
                    {selectedActivity.entidadTipo}
                  </Badge>
                </div>

                {/* Canal + Metadata */}
                <div className="p-4 rounded-lg border space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Canal</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedActivity.canal}
                    </Badge>
                  </div>
                  {selectedActivity.metadata?.subject && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Asunto</p>
                      <p className="text-sm">{selectedActivity.metadata.subject}</p>
                    </div>
                  )}
                  {selectedActivity.metadata?.summary && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Resumen</p>
                      <p className="text-sm">{selectedActivity.metadata.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
