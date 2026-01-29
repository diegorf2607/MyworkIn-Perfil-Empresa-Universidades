"use client"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Kanban, BarChart3, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PipelineFilters, type PipelineFilterState } from "@/components/pipeline/pipeline-filters"
import { PipelineKanban } from "@/components/pipeline/pipeline-kanban"
import { PipelineSummary } from "@/components/pipeline/pipeline-summary"
import { DealDrawer } from "@/components/pipeline/deal-drawer"
import { LostReasonDialog } from "@/components/pipeline/lost-reason-dialog"
import { FollowUpDialog, type FollowUpData } from "@/components/pipeline/followup-dialog"
import { toast } from "sonner"
import { 
  getPipelineDeals, 
  getPipelineTeamMembers, 
  getPipelineCountries,
  updateDealStage,
  updateDealStageWithFollowUp,
  markActionComplete,
  type PipelineDeal,
  type PipelineTeamMember
} from "@/lib/actions/pipeline"
import type { OpportunityStage } from "@/lib/actions/opportunities"
import { useWorkspace } from "@/lib/context/workspace-context"

// Función para verificar si una acción está vencida
function isActionOverdue(date: string): boolean {
  return new Date(date) < new Date()
}

export default function PipelinePage() {
  const { workspace, config } = useWorkspace()
  const [view, setView] = useState<"kanban" | "pipeline">("kanban")
  const [deals, setDeals] = useState<PipelineDeal[]>([])
  const [teamMembers, setTeamMembers] = useState<PipelineTeamMember[]>([])
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<PipelineDeal | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lostDialogOpen, setLostDialogOpen] = useState(false)
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [pendingStageChange, setPendingStageChange] = useState<{
    dealId: string
    dealName: string
    newStage: OpportunityStage
  } | null>(null)
  
  const [filters, setFilters] = useState<PipelineFilterState>({
    periodo: "ultimos_30",
    paises: [],
    owners: [],
    status: "activo",
    soloVencidas: false,
    showNurture: false,
  })

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      const [dealsData, teamData, countriesData] = await Promise.all([
        getPipelineDeals(workspace),
        getPipelineTeamMembers(workspace),
        getPipelineCountries(workspace)
      ])
      setDeals(dealsData)
      setTeamMembers(teamData)
      setCountries(countriesData)
    } catch (error) {
      console.error("Error loading pipeline data:", error)
      toast.error("Error al cargar datos del pipeline")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [workspace])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Refrescar datos
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    toast.success("Datos actualizados")
  }

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
    if (filters.owners.length > 0 && deal.ownerId && !filters.owners.includes(deal.ownerId)) {
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

  const handleDealClick = (deal: PipelineDeal) => {
    setSelectedDeal(deal)
    setDrawerOpen(true)
  }

  const handleStageChange = async (dealId: string, newStage: OpportunityStage) => {
    // Buscar el deal para obtener el nombre
    const deal = deals.find(d => d.id === dealId)
    const dealName = deal?.accountName || config.terminology.entity

    // Si se mueve a Lost, mostrar diálogo para razón
    if (newStage === "lost") {
      setPendingStageChange({ dealId, dealName, newStage })
      setLostDialogOpen(true)
      return
    }

    // Si se mueve a Won, actualizar directamente
    if (newStage === "won") {
      try {
        await updateDealStage(dealId, newStage)
        setDeals(prev => prev.map(d => 
          d.id === dealId 
            ? { ...d, stage: newStage, status: "won" as const, updatedAt: new Date().toISOString(), stuckDays: 0 }
            : d
        ))
        toast.success("¡Oportunidad ganada!")
        return
      } catch (error) {
        console.error("Error updating stage:", error)
        toast.error("Error al actualizar etapa")
        loadData()
        return
      }
    }
    
    // Para otras etapas, mostrar diálogo de seguimiento
    setPendingStageChange({ dealId, dealName, newStage })
    setFollowUpDialogOpen(true)
  }

  const handleLostConfirm = async (reason: string) => {
    if (pendingStageChange) {
      try {
        await updateDealStage(pendingStageChange.dealId, "lost", reason)
        
        setDeals(prev => prev.map(d => 
          d.id === pendingStageChange.dealId 
            ? { 
                ...d, 
                stage: "lost" as OpportunityStage, 
                status: "lost" as const, 
                lostReason: reason,
                updatedAt: new Date().toISOString()
              }
            : d
        ))
        
        toast.success("Oportunidad marcada como perdida")
      } catch (error) {
        console.error("Error marking as lost:", error)
        toast.error("Error al marcar como perdida")
        loadData()
      }
      
      setPendingStageChange(null)
    }
    setLostDialogOpen(false)
  }

  const handleLostCancel = () => {
    setPendingStageChange(null)
    setLostDialogOpen(false)
  }

  const handleFollowUpConfirm = async (followUpData: FollowUpData) => {
    if (pendingStageChange) {
      try {
        // Actualizar etapa y seguimiento
        await updateDealStageWithFollowUp(
          pendingStageChange.dealId, 
          pendingStageChange.newStage,
          followUpData
        )
        
        setDeals(prev => prev.map(d => 
          d.id === pendingStageChange.dealId 
            ? { 
                ...d, 
                stage: pendingStageChange.newStage, 
                status: pendingStageChange.newStage === "nurture" ? "nurture" as const : d.status,
                nextAction: {
                  type: followUpData.type,
                  date: followUpData.date,
                  description: followUpData.description
                },
                updatedAt: new Date().toISOString(),
                stuckDays: 0
              }
            : d
        ))
        
        toast.success("Etapa y seguimiento actualizados")
      } catch (error) {
        console.error("Error updating stage with followup:", error)
        toast.error("Error al actualizar")
        loadData()
      }
      
      setPendingStageChange(null)
    }
    setFollowUpDialogOpen(false)
  }

  const handleFollowUpCancel = () => {
    setPendingStageChange(null)
    setFollowUpDialogOpen(false)
  }

  const handleMarkActionDone = async (dealId: string) => {
    try {
      await markActionComplete(dealId)
      
      setDeals(prev => prev.map(d => 
        d.id === dealId 
          ? { 
              ...d, 
              lastActivity: d.nextAction ? {
                type: d.nextAction.type,
                date: new Date().toISOString(),
                description: `${d.nextAction.type} completado`
              } : d.lastActivity,
              nextAction: null,
              stuckDays: 0,
              updatedAt: new Date().toISOString()
            }
          : d
      ))
      
      toast.success("Acción marcada como completada")
    } catch (error) {
      console.error("Error marking action done:", error)
      toast.error("Error al marcar acción")
      loadData()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando pipeline...</p>
        </div>
      </div>
    )
  }

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
        
        <div className="flex items-center gap-3">
          {/* Botón refrescar */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
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
      </div>

      {/* Filtros */}
      <PipelineFilters
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={teamMembers}
        countries={countries}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {filteredDeals.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Kanban className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No hay oportunidades</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              {deals.length === 0 
                ? "Crea oportunidades en las cuentas para verlas aquí en el pipeline"
                : "No hay oportunidades que coincidan con los filtros seleccionados"}
            </p>
          </div>
        ) : view === "kanban" ? (
          <PipelineKanban
            deals={filteredDeals as any}
            onDealClick={handleDealClick as any}
            onStageChange={handleStageChange as any}
            showNurture={filters.showNurture}
          />
        ) : (
          <PipelineSummary
            deals={filteredDeals as any}
            allDeals={deals as any}
          />
        )}
      </div>

      {/* Drawer de detalle */}
      <DealDrawer
        deal={selectedDeal as any}
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

      {/* Dialog para seguimiento */}
      <FollowUpDialog
        open={followUpDialogOpen}
        dealName={pendingStageChange?.dealName || ""}
        targetStage={pendingStageChange?.newStage || ""}
        onConfirm={handleFollowUpConfirm}
        onCancel={handleFollowUpCancel}
      />
    </div>
  )
}
