"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Building2, DollarSign } from "lucide-react"
import { updateOpportunity } from "@/lib/actions/opportunities"

interface Opportunity {
  id: string
  account_id: string
  product: string
  stage: string
  mrr: number
  probability: number
  next_step: string | null
}

interface Account {
  id: string
  name: string
}

interface KanbanBoardProps {
  opportunities: Opportunity[]
  accounts: Account[]
  onOpportunityClick: (opp: Opportunity) => void
  onRefresh: () => void
}

const stages = [
  { key: "discovery", label: "Discovery", color: "bg-blue-500" },
  { key: "demo", label: "Demo", color: "bg-purple-500" },
  { key: "propuesta", label: "Propuesta", color: "bg-amber-500" },
  { key: "negociacion", label: "Negociación", color: "bg-orange-500" },
] as const

export function KanbanBoard({ opportunities, accounts, onOpportunityClick, onRefresh }: KanbanBoardProps) {
  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || "N/A"
  }

  const getColumnOpps = (stage: string) => {
    return opportunities.filter((o) => o.stage === stage)
  }

  const getColumnTotal = (stage: string) => {
    return getColumnOpps(stage).reduce((sum, o) => sum + o.mrr, 0)
  }

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData("oppId", oppId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault()
    const oppId = e.dataTransfer.getData("oppId")
    if (oppId) {
      await updateOpportunity({ id: oppId, stage: stage as any })
      onRefresh()
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stages.map((stage) => (
        <div
          key={stage.key}
          className="flex flex-col rounded-lg border border-border bg-muted/30"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage.key)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", stage.color)} />
              <span className="font-medium text-sm">{stage.label}</span>
              <Badge variant="secondary" className="text-xs">
                {getColumnOpps(stage.key).length}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">${getColumnTotal(stage.key).toLocaleString()}</span>
          </div>

          {/* Cards */}
          <div className="flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto max-h-[500px]">
            {getColumnOpps(stage.key).map((opp) => (
              <Card
                key={opp.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                draggable
                onDragStart={(e) => handleDragStart(e, opp.id)}
                onClick={() => onOpportunityClick(opp)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {getAccountName(opp.account_id)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{opp.product}</span>
                    <Badge variant="outline" className="text-xs">
                      {opp.probability}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    {opp.mrr.toLocaleString()} MRR
                  </div>
                  {opp.next_step && <p className="text-xs text-muted-foreground line-clamp-1">{opp.next_step}</p>}
                </CardContent>
              </Card>
            ))}

            {getColumnOpps(stage.key).length === 0 && (
              <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                Sin oportunidades
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
