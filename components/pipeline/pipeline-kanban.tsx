"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DealCard } from "./deal-card"
import { 
  type Deal, 
  type DealStage,
  DEAL_COLUMNS,
  NURTURE_COLUMN,
  WON_COLUMN,
  calculateColumnStats,
} from "@/lib/mock-data/deals"
import { Clock, CheckCircle } from "lucide-react"
import { AlertCircle, DollarSign } from "lucide-react"

interface PipelineKanbanProps {
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  onStageChange: (dealId: string, newStage: DealStage) => void
  showNurture?: boolean
}

export function PipelineKanban({
  deals,
  onDealClick,
  onStageChange,
  showNurture = false,
}: PipelineKanbanProps) {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<DealStage | null>(null)

  // Agregar columnas adicionales
  const columns = showNurture 
    ? [...DEAL_COLUMNS, WON_COLUMN, NURTURE_COLUMN] 
    : [...DEAL_COLUMNS, WON_COLUMN]

  // Calcular días de seguimiento
  const getFollowUpDays = (deal: Deal): { days: number; label: string; isOverdue: boolean } | null => {
    if (!deal.nextAction?.date) return null
    const actionDate = new Date(deal.nextAction.date)
    const now = new Date()
    const diffTime = actionDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { days: Math.abs(diffDays), label: `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`, isOverdue: true }
    } else if (diffDays === 0) {
      return { days: 0, label: 'Hoy', isOverdue: false }
    } else {
      return { days: diffDays, label: `En ${diffDays} día${diffDays !== 1 ? 's' : ''}`, isOverdue: false }
    }
  }

  // Obtener deals con seguimiento pendiente
  const dealsWithFollowUp = deals.filter(d => 
    d.nextAction?.date && !["won", "lost", "nurture"].includes(d.stage)
  )

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId)
    setDraggedDealId(dealId)
  }

  const handleDragEnd = () => {
    setDraggedDealId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault()
    setDragOverColumn(stage)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData("dealId")
    if (dealId) {
      const deal = deals.find(d => d.id === dealId)
      if (deal && deal.stage !== stage) {
        onStageChange(dealId, stage)
      }
    }
    setDraggedDealId(null)
    setDragOverColumn(null)
  }

  const getColumnDeals = (stage: DealStage) => {
    return deals.filter(d => d.stage === stage)
  }

  const formatMrr = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toLocaleString()}`
  }

  // Calcular totales globales
  const totalPipeline = deals
    .filter(d => !["won", "lost", "nurture"].includes(d.stage))
    .reduce((sum, d) => sum + d.mrr, 0)
  
  const totalOverdue = deals.filter(d => {
    if (!d.nextAction) return false
    return new Date(d.nextAction.date) < new Date()
  }).length

  return (
    <div className="flex flex-col h-full">
      {/* Pipeline Summary Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">Pipeline Total:</span>
            <span className="text-lg font-bold text-emerald-600">
              ${totalPipeline.toLocaleString()} MRR
            </span>
          </div>
          {totalOverdue > 0 && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{totalOverdue} acciones vencidas</span>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {deals.filter(d => d.status === "activo").length} oportunidades activas
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1">
        <div className="flex gap-4 p-4 h-full min-h-[600px]">
          {columns.map((column) => {
            const columnDeals = getColumnDeals(column.key)
            const stats = calculateColumnStats(deals, column.key)
            const isDropTarget = dragOverColumn === column.key
            const isDragging = draggedDealId !== null

            return (
              <div
                key={column.key}
                className={cn(
                  "flex flex-col w-[300px] flex-shrink-0 rounded-xl border transition-all duration-200",
                  isDropTarget && "ring-2 ring-primary ring-offset-2",
                  isDragging && !isDropTarget && "opacity-80"
                )}
                onDragOver={(e) => handleDragOver(e, column.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                {/* Column Header */}
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-t-xl border-b",
                  column.bgColor
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", column.color)} />
                    <span className="font-medium text-sm">{column.label}</span>
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {stats.count}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {stats.overdueCount > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 px-1.5 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {stats.overdueCount}
                      </Badge>
                    )}
                    <span className="text-xs font-medium text-emerald-700">
                      {formatMrr(stats.totalMrr)}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] bg-slate-50/50">
                  {columnDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => onDealClick(deal)}
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedDealId === deal.id}
                    />
                  ))}

                  {columnDeals.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm text-muted-foreground bg-white/50 rounded-lg border border-dashed">
                      Sin oportunidades
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Columna de Seguimiento - muestra deals con next_action */}
          <div className="flex flex-col w-[300px] flex-shrink-0 rounded-xl border bg-gradient-to-b from-purple-50 to-white">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 rounded-t-xl border-b bg-purple-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-purple-800">Seguimientos</span>
                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-purple-200 text-purple-800">
                  {dealsWithFollowUp.length}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {dealsWithFollowUp.filter(d => {
                  const followUp = getFollowUpDays(d)
                  return followUp?.isOverdue
                }).length > 0 && (
                  <Badge variant="destructive" className="text-xs h-5 px-1.5 gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {dealsWithFollowUp.filter(d => getFollowUpDays(d)?.isOverdue).length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
              {dealsWithFollowUp
                .sort((a, b) => {
                  const dateA = new Date(a.nextAction?.date || 0).getTime()
                  const dateB = new Date(b.nextAction?.date || 0).getTime()
                  return dateA - dateB
                })
                .map((deal) => {
                  const followUp = getFollowUpDays(deal)
                  return (
                    <div
                      key={`followup-${deal.id}`}
                      className={cn(
                        "p-3 rounded-lg border bg-white cursor-pointer hover:shadow-md transition-all",
                        followUp?.isOverdue && "border-red-300 bg-red-50"
                      )}
                      onClick={() => onDealClick(deal)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-medium text-sm line-clamp-1">{deal.accountName}</span>
                        <Badge 
                          variant={followUp?.isOverdue ? "destructive" : followUp?.days === 0 ? "default" : "secondary"} 
                          className={cn(
                            "text-xs shrink-0",
                            !followUp?.isOverdue && followUp?.days === 0 && "bg-blue-500"
                          )}
                        >
                          {followUp?.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {deal.nextAction?.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600 font-medium capitalize">
                          {deal.nextAction?.type}
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          {formatMrr(deal.mrr)}
                        </span>
                      </div>
                    </div>
                  )
                })}

              {dealsWithFollowUp.length === 0 && (
                <div className="flex flex-col items-center justify-center h-24 text-sm text-muted-foreground bg-white/50 rounded-lg border border-dashed gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span>Sin seguimientos pendientes</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
