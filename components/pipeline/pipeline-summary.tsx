"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { 
  type Deal,
  DEAL_COLUMNS,
  COUNTRY_FLAGS,
  COUNTRY_NAMES,
  calculateColumnStats,
} from "@/lib/mock-data/deals"

interface PipelineSummaryProps {
  deals: Deal[]
  allDeals: Deal[]
}

export function PipelineSummary({ deals, allDeals }: PipelineSummaryProps) {
  // Calcular métricas generales
  const activeDeals = deals.filter(d => d.status === "activo")
  const totalPipelineMrr = activeDeals.reduce((sum, d) => sum + d.mrr, 0)
  const weightedPipeline = activeDeals.reduce((sum, d) => sum + (d.mrr * d.probability / 100), 0)
  const wonDeals = allDeals.filter(d => d.status === "won")
  const lostDeals = allDeals.filter(d => d.status === "lost")
  const winRate = wonDeals.length + lostDeals.length > 0 
    ? (wonDeals.length / (wonDeals.length + lostDeals.length) * 100).toFixed(0)
    : 0

  // Funnel por etapa
  const funnelData = DEAL_COLUMNS.filter(c => !["won", "lost"].includes(c.key)).map(column => {
    const stats = calculateColumnStats(deals, column.key)
    return {
      ...column,
      ...stats,
    }
  })

  // Aging por etapa (deals con >14 días en etapa)
  const agingDeals = deals.filter(d => {
    const daysInStage = Math.floor(
      (new Date().getTime() - new Date(d.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysInStage > 14 && d.status === "activo"
  })

  // Por país
  const byCountry = Object.entries(
    deals.reduce((acc, deal) => {
      if (!acc[deal.country]) {
        acc[deal.country] = { count: 0, mrr: 0, won: 0, lost: 0 }
      }
      acc[deal.country].count++
      acc[deal.country].mrr += deal.mrr
      if (deal.status === "won") acc[deal.country].won++
      if (deal.status === "lost") acc[deal.country].lost++
      return acc
    }, {} as Record<string, { count: number; mrr: number; won: number; lost: number }>)
  ).sort((a, b) => b[1].mrr - a[1].mrr)

  // Por Owner
  const byOwner = Object.entries(
    deals.reduce((acc, deal) => {
      if (!acc[deal.ownerId]) {
        acc[deal.ownerId] = { name: deal.ownerName, role: deal.ownerRole, count: 0, mrr: 0, won: 0, lost: 0 }
      }
      acc[deal.ownerId].count++
      acc[deal.ownerId].mrr += deal.mrr
      if (deal.status === "won") acc[deal.ownerId].won++
      if (deal.status === "lost") acc[deal.ownerId].lost++
      return acc
    }, {} as Record<string, { name: string; role: string; count: number; mrr: number; won: number; lost: number }>)
  ).sort((a, b) => b[1].mrr - a[1].mrr)

  const maxMrr = Math.max(...funnelData.map(f => f.totalMrr), 1)

  return (
    <div className="p-6 space-y-6 overflow-auto max-h-[calc(100vh-200px)]">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Total</p>
                <p className="text-2xl font-bold text-emerald-700">
                  ${totalPipelineMrr.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">MRR mensual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Ponderado</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${Math.round(weightedPipeline).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">MRR ajustado por prob.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-violet-700">
                  {winRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {wonDeals.length} won / {lostDeals.length} lost
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Riesgo</p>
                <p className="text-2xl font-bold text-amber-700">
                  {agingDeals.length}
                </p>
                <p className="text-xs text-muted-foreground">Deals &gt;14 días sin mover</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel por etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Funnel por Etapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelData.map((stage) => (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <span className="text-sm font-medium">{stage.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stage.count}
                    </Badge>
                    {stage.overdueCount > 0 && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {stage.overdueCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    ${stage.totalMrr.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(stage.totalMrr / maxMrr) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por País */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Pipeline por País
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>País</TableHead>
                  <TableHead className="text-right">Deals</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byCountry.map(([code, data]) => {
                  const wr = data.won + data.lost > 0 
                    ? Math.round(data.won / (data.won + data.lost) * 100) 
                    : "-"
                  return (
                    <TableRow key={code}>
                      <TableCell>
                        <span className="mr-2">{COUNTRY_FLAGS[code]}</span>
                        {COUNTRY_NAMES[code]}
                      </TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        ${data.mrr.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof wr === "number" ? `${wr}%` : wr}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Por Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Pipeline por Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Deals</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byOwner.map(([id, data]) => {
                  const wr = data.won + data.lost > 0 
                    ? Math.round(data.won / (data.won + data.lost) * 100) 
                    : "-"
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{data.name}</span>
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            {data.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        ${data.mrr.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {typeof wr === "number" ? `${wr}%` : wr}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Aging Deals */}
      {agingDeals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-700">
              <AlertCircle className="h-5 w-5" />
              Deals en Riesgo (&gt;14 días sin movimiento)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Universidad</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Días</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingDeals.map((deal) => {
                  const daysInStage = Math.floor(
                    (new Date().getTime() - new Date(deal.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const stageLabel = DEAL_COLUMNS.find(c => c.key === deal.stage)?.label || deal.stage
                  return (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.accountName}</TableCell>
                      <TableCell>
                        {COUNTRY_FLAGS[deal.country]} {deal.country}
                      </TableCell>
                      <TableCell>{stageLabel}</TableCell>
                      <TableCell>{deal.ownerName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive" className="text-xs">
                          {daysInStage}d
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        ${deal.mrr.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
