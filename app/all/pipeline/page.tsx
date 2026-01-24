"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Kanban, BarChart3 } from "lucide-react"
import { PipelineFilters, type PipelineFilterState } from "@/components/pipeline/pipeline-filters"
import { PipelineKanban } from "@/components/pipeline/pipeline-kanban"
import { PipelineSummary } from "@/components/pipeline/pipeline-summary"
import { DealDrawer } from "@/components/pipeline/deal-drawer"
import { LostReasonDialog } from "@/components/pipeline/lost-reason-dialog"
import { 
  MOCK_DEALS, 
  MOCK_TEAM, 
  type Deal,
  type DealStage,
  isActionOverdue 
} from "@/lib/mock-data/deals"

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "pipeline">("kanban")
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [pendingStageChange, setPendingStageChange] = useState<{
    dealId: string
    newStage: DealStage
  } | null>(null)
  
  const [filters, setFilters] = useState<PipelineFilterState>({
    periodo: "ultimos_30",
    paises: [],
    owners: [],
    status: "activo",
    soloVencidas: false,
    showNurture: false,
  })

  // Filtrar deals según filtros activos
  const filteredDeals = deals.filter(deal => {
    // Filtro de status
    if (filters.status !== "todos") {
      if (filters.status === "activo" && deal.status !== "activo") return false
      if (filters.status === "won" && deal.status !== "won") return false
      if (filters.status === "lost" && deal.status !== "lost") return false
      if (filters.status === "nurture" && deal.status !== "nurture") return false
    }
    
    // Filtro de países
    if (filters.paises.length > 0 && !filters.paises.includes(deal.country)) {
      return false
    }
    
    // Filtro de owners
    if (filters.owners.length > 0 && !filters.owners.includes(deal.ownerId)) {
      return false
    }
    
    // Filtro solo vencidas
    if (filters.soloVencidas && deal.nextAction && !isActionOverdue(deal.nextAction.date)) {
      return false
    }
    
    // Ocultar nurture si no está activado
    if (!filters.showNurture && deal.stage === "nurture") {
      return false
    }
    
    return true
  })

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
    setDrawerOpen(true)
  }

  const handleStageChange = (dealId: string, newStage: DealStage) => {
    // Si se mueve a Lost, mostrar diálogo para razón
    if (newStage === "lost") {
      setPendingStageChange({ dealId, newStage })
      setLostDialogOpen(true)
      return
    }
    
    // Actualizar stage directamente
    setDeals(prev => prev.map(d => 
      d.id === dealId 
        ? { ...d, stage: newStage, status: newStage === "won" ? "won" : d.status }
        : d
    ))
  }

  const handleLostConfirm = (reason: string) => {
    if (pendingStageChange) {
      setDeals(prev => prev.map(d => 
        d.id === pendingStageChange.dealId 
          ? { ...d, stage: "lost", status: "lost", lostReason: reason }
          : d
      ))
      setPendingStageChange(null)
    }
    setLostDialogOpen(false)
  }

  const handleLostCancel = () => {
    setPendingStageChange(null)
    setLostDialogOpen(false)
  }

  const handleMarkActionDone = (dealId: string) => {
    setDeals(prev => prev.map(d => 
      d.id === dealId 
        ? { 
            ...d, 
            lastActivity: d.nextAction ? {
              type: d.nextAction.type === "reunion" ? "reunion" : 
                    d.nextAction.type === "demo" ? "demo" :
                    d.nextAction.type === "llamada" ? "llamada" : "email",
              date: new Date().toISOString(),
              description: `${d.nextAction.type} completado`
            } : d.lastActivity,
            nextAction: null,
            stuckDays: 0,
            updatedAt: new Date().toISOString()
          }
        : d
    ))
  }

  const countries = [
    { code: "AR", name: "Argentina" },
    { code: "BR", name: "Brasil" },
    { code: "CL", name: "Chile" },
    { code: "CO", name: "Colombia" },
    { code: "MX", name: "México" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header con título y toggle */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestión de oportunidades y seguimiento post-primera reunión
          </p>
        </div>
        
        {/* Toggle Kanban / Pipeline */}
        <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "pipeline")}>
          <TabsList className="grid grid-cols-2 w-[220px]">
            <TabsTrigger value="kanban" className="gap-2">
              <Kanban className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filtros */}
      <PipelineFilters
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={MOCK_TEAM}
        countries={countries}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {view === "kanban" ? (
          <PipelineKanban
            deals={filteredDeals}
            onDealClick={handleDealClick}
            onStageChange={handleStageChange}
            showNurture={filters.showNurture}
          />
        ) : (
          <PipelineSummary
            deals={filteredDeals}
            allDeals={deals}
          />
        )}
      </div>

      {/* Drawer de detalle */}
      <DealDrawer
        deal={selectedDeal}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMarkActionDone={handleMarkActionDone}
      />

      {/* Dialog para motivo de pérdida */}
      <LostReasonDialog
        open={lostDialogOpen}
        onConfirm={handleLostConfirm}
        onCancel={handleLostCancel}
      />
    </div>
  )
}
