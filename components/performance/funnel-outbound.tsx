"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowRight, TrendingDown } from "lucide-react"

export interface FunnelData {
  funnel: Array<{
    etapa: string
    cantidad: number
    conversion?: number
  }>
  weakestPoint: string
  weakestConversion: number
}

interface FunnelOutboundProps {
  data: FunnelData
}

export function FunnelOutbound({ data }: FunnelOutboundProps) {
  const maxCount = Math.max(...data.funnel.map((s) => s.cantidad), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Funnel de Outbound</CardTitle>
            <CardDescription>Conversión entre etapas del pipeline</CardDescription>
          </div>
          {data.weakestPoint && data.weakestConversion < 100 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                <span className="font-medium">Punto más débil:</span> {data.weakestPoint} ({data.weakestConversion}%)
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.funnel.map((stage, index) => {
            const widthPercent = (stage.cantidad / maxCount) * 100
            const isWeakest =
              data.weakestPoint.includes(stage.etapa) && index > 0 && stage.conversion === data.weakestConversion

            return (
              <div key={stage.etapa}>
                {/* Conversion arrow from previous */}
                {index > 0 && stage.conversion !== undefined && (
                  <div className="flex items-center gap-2 mb-2 ml-4">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${isWeakest ? "text-amber-600" : "text-muted-foreground"}`}>
                      {stage.conversion}%
                    </span>
                    {isWeakest && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Mayor drop-off
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stage bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div
                      className={`h-10 rounded-md flex items-center px-3 transition-all ${
                        isWeakest ? "bg-amber-100 border border-amber-300" : "bg-primary/10"
                      }`}
                      style={{ width: `${Math.max(widthPercent, 20)}%` }}
                    >
                      <span className="text-sm font-medium truncate">{stage.etapa}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-lg font-bold tabular-nums">{stage.cantidad}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/10" />
              <span>Etapa normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>Punto más débil</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
