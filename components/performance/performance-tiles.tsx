"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Building2,
  Users,
  Mail,
  RotateCcw,
  CalendarCheck,
  Target,
  Calendar,
  UserX,
  Trophy,
  DollarSign,
  Percent,
  AlertCircle,
  Ban,
} from "lucide-react"
import { useWorkspace } from "@/lib/context/workspace-context"

interface SegmentedControlProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

function SegmentedControl({ value, onChange, options }: SegmentedControlProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export interface PersonPerformance {
  member: {
    id: string
    name: string
    role: string
    country: string
  }
  activity: {
    universidadesCreadas: number
    leadsCreados: number
    kdmsCreados: number
    correosEnviados: number
    followUpsEjecutados: number
    diasActivos: number
  }
  engagement: {
    tasaEntrega: number
    tasaApertura: number
    tasaRespuesta: number
    tasaInteresados: number
    tasaOptOut: number
    tasaRebote: number
  }
  results: {
    sqlsGenerados: number
    reunionesAgendadas: number
    reunionesCompletadas: number
    noShows: number
    dealsGanados: number
    mrrGenerado: number
  }
  previousPeriod?: {
    activity: PersonPerformance["activity"]
    engagement: PersonPerformance["engagement"]
    results: PersonPerformance["results"]
  }
}

interface PerformanceTilesGridProps {
  data: PersonPerformance[]
  showComparison?: boolean
}

function formatDelta(delta: number): string {
  if (delta === 0 || (delta > -0.5 && delta < 0.5)) return "0%"
  return `${delta > 0 ? "+" : ""}${Math.round(delta)}%`
}

function calcularDelta(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0
  return Math.round(((actual - anterior) / anterior) * 100)
}

function getDeltaColor(delta: number, invertDelta?: boolean): string {
  if (delta === 0) return "text-muted-foreground"
  const isPositive = invertDelta ? delta < 0 : delta > 0
  return isPositive ? "text-emerald-600" : "text-red-600"
}

interface MetricItemProps {
  label: string
  value: number | string
  previousValue?: number
  showComparison: boolean
  icon: React.ElementType
  isPercentage?: boolean
  isCurrency?: boolean
  invertDelta?: boolean
}

function MetricItem({
  label,
  value,
  previousValue,
  showComparison,
  icon: Icon,
  isPercentage,
  isCurrency,
  invertDelta,
}: MetricItemProps) {
  const numericValue = typeof value === "string" ? Number.parseFloat(value) : value
  const delta = previousValue !== undefined ? calcularDelta(numericValue, previousValue) : 0
  const deltaColor = getDeltaColor(delta, invertDelta)

  const formatValue = () => {
    if (isPercentage) {
      return `${numericValue.toFixed(1)}%`
    }
    if (isCurrency) {
      return `$${numericValue.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return numericValue.toLocaleString()
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold tabular-nums">{formatValue()}</span>
        {showComparison && previousValue !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs ${deltaColor}`}>
            {delta > 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : delta < 0 ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span className="tabular-nums">{formatDelta(delta)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function PerformanceTilesGrid({ data, showComparison = false }: PerformanceTilesGridProps) {
  const { config } = useWorkspace()
  const [viewMode, setViewMode] = useState<string>("actividad")
  const [selectedPerson, setSelectedPerson] = useState<PersonPerformance | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const viewOptions = [
    { value: "actividad", label: "Actividad" },
    { value: "engagement", label: "Engagement" },
    { value: "resultados", label: "Resultados" },
  ]

  const renderMetrics = (person: PersonPerformance) => {
    switch (viewMode) {
      case "actividad":
        return (
          <div className="space-y-0.5">
            <MetricItem
              label={config.terminology.entities}
              value={person.activity.universidadesCreadas}
              previousValue={person.previousPeriod?.activity.universidadesCreadas}
              showComparison={showComparison}
              icon={Building2}
            />
            <MetricItem
              label="Leads"
              value={person.activity.leadsCreados}
              previousValue={person.previousPeriod?.activity.leadsCreados}
              showComparison={showComparison}
              icon={Users}
            />
            <MetricItem
              label="KDMs"
              value={person.activity.kdmsCreados}
              previousValue={person.previousPeriod?.activity.kdmsCreados}
              showComparison={showComparison}
              icon={User}
            />
            <MetricItem
              label="Correos"
              value={person.activity.correosEnviados}
              previousValue={person.previousPeriod?.activity.correosEnviados}
              showComparison={showComparison}
              icon={Mail}
            />
            <MetricItem
              label="Follow-ups"
              value={person.activity.followUpsEjecutados}
              previousValue={person.previousPeriod?.activity.followUpsEjecutados}
              showComparison={showComparison}
              icon={RotateCcw}
            />
            <MetricItem
              label="Días activos"
              value={person.activity.diasActivos}
              previousValue={person.previousPeriod?.activity.diasActivos}
              showComparison={showComparison}
              icon={CalendarCheck}
            />
          </div>
        )
      case "engagement":
        return (
          <div className="space-y-0.5">
            <MetricItem
              label="Tasa entrega"
              value={person.engagement.tasaEntrega}
              previousValue={person.previousPeriod?.engagement.tasaEntrega}
              showComparison={showComparison}
              icon={Mail}
              isPercentage
            />
            <MetricItem
              label="Tasa apertura"
              value={person.engagement.tasaApertura}
              previousValue={person.previousPeriod?.engagement.tasaApertura}
              showComparison={showComparison}
              icon={Percent}
              isPercentage
            />
            <MetricItem
              label="Tasa respuesta"
              value={person.engagement.tasaRespuesta}
              previousValue={person.previousPeriod?.engagement.tasaRespuesta}
              showComparison={showComparison}
              icon={Percent}
              isPercentage
            />
            <MetricItem
              label="Interesados"
              value={person.engagement.tasaInteresados}
              previousValue={person.previousPeriod?.engagement.tasaInteresados}
              showComparison={showComparison}
              icon={Percent}
              isPercentage
            />
            <MetricItem
              label="Opt-out"
              value={person.engagement.tasaOptOut}
              previousValue={person.previousPeriod?.engagement.tasaOptOut}
              showComparison={showComparison}
              icon={Ban}
              isPercentage
              invertDelta
            />
            <MetricItem
              label="Rebote"
              value={person.engagement.tasaRebote}
              previousValue={person.previousPeriod?.engagement.tasaRebote}
              showComparison={showComparison}
              icon={AlertCircle}
              isPercentage
              invertDelta
            />
          </div>
        )
      case "resultados":
        return (
          <div className="space-y-0.5">
            <MetricItem
              label="SQLs"
              value={person.results.sqlsGenerados}
              previousValue={person.previousPeriod?.results.sqlsGenerados}
              showComparison={showComparison}
              icon={Target}
            />
            <MetricItem
              label="Reuniones agendadas"
              value={person.results.reunionesAgendadas}
              previousValue={person.previousPeriod?.results.reunionesAgendadas}
              showComparison={showComparison}
              icon={Calendar}
            />
            <MetricItem
              label="Reuniones completadas"
              value={person.results.reunionesCompletadas}
              previousValue={person.previousPeriod?.results.reunionesCompletadas}
              showComparison={showComparison}
              icon={CalendarCheck}
            />
            <MetricItem
              label="No-shows"
              value={person.results.noShows}
              previousValue={person.previousPeriod?.results.noShows}
              showComparison={showComparison}
              icon={UserX}
              invertDelta
            />
            <MetricItem
              label="Deals ganados"
              value={person.results.dealsGanados}
              previousValue={person.previousPeriod?.results.dealsGanados}
              showComparison={showComparison}
              icon={Trophy}
            />
            <MetricItem
              label="MRR generado"
              value={person.results.mrrGenerado}
              previousValue={person.previousPeriod?.results.mrrGenerado}
              showComparison={showComparison}
              icon={DollarSign}
              isCurrency
            />
          </div>
        )
      default:
        return null
    }
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No hay datos de equipo para mostrar</div>
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {data.length} {data.length === 1 ? "persona" : "personas"}
        </p>
        <SegmentedControl value={viewMode} onChange={setViewMode} options={viewOptions} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((person) => (
          <Card
            key={person.member.id}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedPerson(person)
              setSheetOpen(true)
            }}
          >
            <CardHeader className="pb-2 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {person.member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <CardTitle className="text-base">{person.member.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={person.member.role === "SDR" ? "default" : "secondary"} className="text-xs">
                      {person.member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{person.member.country}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-4">{renderMetrics(person)}</CardContent>
          </Card>
        ))}
      </div>

      {/* Sheet de detalle */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md p-6">
          <SheetHeader className="pb-4">
            <SheetTitle>Detalle de {selectedPerson?.member.name}</SheetTitle>
            <SheetDescription>
              {selectedPerson?.member.role} - {selectedPerson?.member.country}
            </SheetDescription>
          </SheetHeader>
          {selectedPerson && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-3">Actividad</p>
                {renderMetrics({ ...selectedPerson })}
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">Evolución temporal</p>
                <p className="text-sm text-muted-foreground italic">Gráfico de evolución próximamente</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
