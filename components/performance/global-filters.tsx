"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

export interface FilterState {
  periodo: string
  comparar: boolean
  rol: string
  usuario: string
  pais: string
  dateRange?: DateRange
}

interface GlobalFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  teamMembers?: Array<{ id: string; name: string; role: string }>
  countries?: Array<{ code: string; name: string }>
  showPeriodo?: boolean
}

export function GlobalFilters({
  filters,
  onFiltersChange,
  teamMembers = [],
  countries = [],
  showPeriodo = true,
}: GlobalFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(filters.dateRange)

  const periodos = [
    { value: "hoy", label: "Hoy" },
    { value: "esta_semana", label: "Esta semana" },
    { value: "ultimos_7", label: "Últimos 7 días" },
    { value: "ultimos_30", label: "Últimos 30 días" },
    { value: "rango_personalizado", label: "Rango personalizado" },
  ]

  const handlePeriodoChange = (value: string) => {
    onFiltersChange({ ...filters, periodo: value })
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onFiltersChange({ ...filters, dateRange: range, periodo: "rango_personalizado" })
  }

  const activeFiltersCount = [filters.rol !== "todos", filters.usuario !== "todos", filters.pais !== "todos"].filter(
    Boolean,
  ).length

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex flex-wrap items-center gap-3 p-4">
        {/* Período */}
        {showPeriodo && (
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Período:</Label>
            <Select value={filters.periodo} onValueChange={handlePeriodoChange}>
              <SelectTrigger className="w-[180px]">
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
        )}

        {/* Date Range Picker (solo si período es personalizado) */}
        {filters.periodo === "rango_personalizado" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                      {format(dateRange.to, "dd MMM", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: es })
                  )
                ) : (
                  "Seleccionar fechas"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Comparar toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50">
          <Switch
            id="comparar"
            checked={filters.comparar}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, comparar: checked })}
          />
          <Label htmlFor="comparar" className="text-sm cursor-pointer">
            Comparar vs anterior
          </Label>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Rol */}
        <Select value={filters.rol} onValueChange={(v) => onFiltersChange({ ...filters, rol: v })}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="SDR">SDR</SelectItem>
            <SelectItem value="AE">AE</SelectItem>
          </SelectContent>
        </Select>

        {/* Usuario - Now uses dynamic teamMembers prop */}
        <Select value={filters.usuario} onValueChange={(v) => onFiltersChange({ ...filters, usuario: v })}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los usuarios</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* País - Now uses dynamic countries prop */}
        <Select value={filters.pais} onValueChange={(v) => onFiltersChange({ ...filters, pais: v })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los países</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onFiltersChange({
                ...filters,
                rol: "todos",
                usuario: "todos",
                pais: "todos",
              })
            }
            className="gap-1"
          >
            <X className="h-3 w-3" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  )
}
