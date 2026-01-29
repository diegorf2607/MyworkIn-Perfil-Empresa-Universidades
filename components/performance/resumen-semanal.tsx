"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Building2,
  Users,
  User,
  Mail,
  Calendar,
  Target,
  Trophy,
  DollarSign,
} from "lucide-react"
import { useWorkspace } from "@/lib/context/workspace-context"

export interface WeeklySummaryData {
  universidadesCreadas: number
  leadsCreados: number
  kdmsCreados: number
  correosEnviados: number
  reunionesAgendadas: number
  reunionesCompletadas: number
  sqlsGenerados: number
  dealsGanados: number
  mrrGenerado: number
}

interface ResumenSemanalProps {
  data: WeeklySummaryData | null
  previousData?: WeeklySummaryData | null
  showComparison?: boolean
  loading?: boolean
}

function calcularDelta(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0
  const delta = ((actual - anterior) / anterior) * 100
  return Math.abs(delta) < 0.5 ? 0 : Math.round(delta)
}

function getDeltaColor(delta: number): string {
  if (delta === 0) return "text-muted-foreground"
  return delta > 0 ? "text-emerald-600" : "text-red-600"
}

function formatDelta(delta: number): string {
  if (delta === 0) return "0%"
  return `${delta > 0 ? "+" : ""}${delta}%`
}

export function ResumenSemanalBlock({
  data,
  previousData,
  showComparison = true,
  loading = false,
}: ResumenSemanalProps) {
  const { config } = useWorkspace()
  
  if (loading || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const metricas = [
    {
      label: config.terminology.entities,
      actual: data.universidadesCreadas,
      anterior: previousData?.universidadesCreadas || 0,
      icon: Building2,
    },
    {
      label: "Leads",
      actual: data.leadsCreados,
      anterior: previousData?.leadsCreados || 0,
      icon: Users,
    },
    {
      label: "KDMs",
      actual: data.kdmsCreados,
      anterior: previousData?.kdmsCreados || 0,
      icon: User,
    },
    {
      label: "Correos",
      actual: data.correosEnviados,
      anterior: previousData?.correosEnviados || 0,
      icon: Mail,
    },
    {
      label: "Reuniones",
      actual: data.reunionesAgendadas,
      anterior: previousData?.reunionesAgendadas || 0,
      icon: Calendar,
    },
    {
      label: "SQLs",
      actual: data.sqlsGenerados,
      anterior: previousData?.sqlsGenerados || 0,
      icon: Target,
    },
    {
      label: "Deals Won",
      actual: data.dealsGanados,
      anterior: previousData?.dealsGanados || 0,
      icon: Trophy,
    },
    {
      label: "MRR",
      actual: data.mrrGenerado,
      anterior: previousData?.mrrGenerado || 0,
      icon: DollarSign,
      isCurrency: true,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Resumen del Período</CardTitle>
          {showComparison && previousData && (
            <Badge variant="outline" className="text-xs">
              vs período anterior
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {metricas.map((metrica) => {
            const delta = calcularDelta(metrica.actual, metrica.anterior)
            const deltaColor = getDeltaColor(delta)
            const Icon = metrica.icon

            return (
              <div
                key={metrica.label}
                className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-xl font-bold tabular-nums">
                  {metrica.isCurrency
                    ? `$${metrica.actual.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`
                    : metrica.actual.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mb-1">{metrica.label}</p>
                {showComparison && previousData && (
                  <div className={`flex items-center gap-1 text-xs ${deltaColor}`}>
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
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
