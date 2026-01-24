"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle } from "lucide-react"

export interface PipelineFilterState {
  periodo: string
  paises: string[]
  owners: string[]
  status: "todos" | "activo" | "won" | "lost" | "nurture"
  soloVencidas: boolean
  showNurture: boolean
}

interface PipelineFiltersProps {
  filters: PipelineFilterState
  onFiltersChange: (filters: PipelineFilterState) => void
  teamMembers?: Array<{ id: string; name: string; role: string }>
  countries?: Array<{ code: string; name: string }>
}

export function PipelineFilters({
  filters,
  onFiltersChange,
  teamMembers = [],
  countries = [],
}: PipelineFiltersProps) {
  const periodos = [
    { value: "ultimos_7", label: "Últimos 7 días" },
    { value: "ultimos_30", label: "Últimos 30 días" },
    { value: "ultimos_90", label: "Últimos 90 días" },
    { value: "este_año", label: "Este año" },
    { value: "todos", label: "Todo el tiempo" },
  ]

  const statusOptions = [
    { value: "todos", label: "Todos" },
    { value: "activo", label: "Activos" },
    { value: "won", label: "Ganados" },
    { value: "lost", label: "Perdidos" },
    { value: "nurture", label: "Nurture" },
  ]

  const handlePaisToggle = (code: string) => {
    const newPaises = filters.paises.includes(code)
      ? filters.paises.filter(p => p !== code)
      : [...filters.paises, code]
    onFiltersChange({ ...filters, paises: newPaises })
  }

  const handleOwnerToggle = (id: string) => {
    const newOwners = filters.owners.includes(id)
      ? filters.owners.filter(o => o !== id)
      : [...filters.owners, id]
    onFiltersChange({ ...filters, owners: newOwners })
  }

  const activeFiltersCount = [
    filters.paises.length > 0,
    filters.owners.length > 0,
    filters.status !== "activo",
    filters.soloVencidas,
  ].filter(Boolean).length

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      paises: [],
      owners: [],
      status: "activo",
      soloVencidas: false,
    })
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex flex-wrap items-center gap-3 px-6 py-3">
        {/* Período */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">Período:</Label>
          <Select 
            value={filters.periodo} 
            onValueChange={(v) => onFiltersChange({ ...filters, periodo: v })}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* País (multi-select como badges) */}
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">País:</Label>
          <div className="flex flex-wrap gap-1">
            {countries.map((c) => (
              <Badge
                key={c.code}
                variant={filters.paises.includes(c.code) ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary/80"
                onClick={() => handlePaisToggle(c.code)}
              >
                {c.code}
              </Badge>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Owner */}
        <Select
          value={filters.owners.length === 0 ? "todos" : filters.owners[0]}
          onValueChange={(v) => {
            if (v === "todos") {
              onFiltersChange({ ...filters, owners: [] })
            } else {
              handleOwnerToggle(v)
            }
          }}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Todos los usuarios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los usuarios</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} ({m.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={filters.status}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v as any })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border" />

        {/* Solo vencidas toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <Switch
            id="solo-vencidas"
            checked={filters.soloVencidas}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, soloVencidas: checked })}
          />
          <Label htmlFor="solo-vencidas" className="text-sm cursor-pointer">
            Solo vencidas
          </Label>
        </div>

        {/* Mostrar Nurture toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50">
          <Switch
            id="show-nurture"
            checked={filters.showNurture}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, showNurture: checked })}
          />
          <Label htmlFor="show-nurture" className="text-sm cursor-pointer">
            Mostrar Nurture
          </Label>
        </div>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 ml-auto"
          >
            <X className="h-3 w-3" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  )
}
