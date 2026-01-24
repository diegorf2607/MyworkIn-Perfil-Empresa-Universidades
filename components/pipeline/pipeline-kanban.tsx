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
  calculateColumnStats,
} from "@/lib/mock-data/deals"
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

  const columns = showNurture ? [...DEAL_COLUMNS, NURTURE_COLUMN] : DEAL_COLUMNS

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
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
