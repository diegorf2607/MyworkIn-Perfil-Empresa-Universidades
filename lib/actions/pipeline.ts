"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import type { OpportunityStage } from "./opportunities"

export interface PipelineDeal {
  id: string
  accountId: string
  accountName: string
  accountCity: string | null
  country: string
  stage: OpportunityStage
  ownerId: string | null
  ownerName: string | null
  ownerRole: "SDR" | "AE" | null
  mrr: number
  currency: "USD"
  icpTier: "A" | "B" | "C"
  nextAction: {
    type: string
    date: string
    description: string
  } | null
  lastActivity: {
    type: string
    date: string
    description: string
  } | null
  createdAt: string
  updatedAt: string
  expectedCloseDate: string | null
  probability: number
  status: "activo" | "won" | "lost" | "nurture"
  lostReason?: string
  source: "inbound" | "outbound" | "referido"
  stuckDays: number
  product: string | null
}

export interface PipelineTeamMember {
  id: string
  name: string
  role: "SDR" | "AE"
  avatar: string | null
}

// Mapear stages legacy a los nuevos
function mapLegacyStage(stage: string | null): OpportunityStage {
  switch (stage) {
    case "discovery":
      return "primera_reunion_realizada"
    case "demo":
      return "demo_programada"
    case "propuesta":
      return "propuesta_enviada"
    case "negociacion":
    case "won":
    case "lost":
    case "nurture":
    case "primera_reunion_programada":
    case "primera_reunion_realizada":
    case "demo_programada":
    case "propuesta_enviada":
      return stage as OpportunityStage
    default:
      return "primera_reunion_programada"
  }
}

// Calcular días sin actividad
function calculateStuckDays(updatedAt: string): number {
  const lastUpdate = new Date(updatedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - lastUpdate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Determinar status basado en stage
function getStatusFromStage(stage: OpportunityStage): "activo" | "won" | "lost" | "nurture" {
  if (stage === "won") return "won"
  if (stage === "lost") return "lost"
  if (stage === "nurture") return "nurture"
  return "activo"
}

// Obtener todos los deals para el Pipeline
// NOTA: Usa la tabla accounts con stage "opp", "won", "lost" ya que la tabla opportunities está vacía
export async function getPipelineDeals(): Promise<PipelineDeal[]> {
  noStore()
  const supabase = createAdminClient()
  
  // Obtener cuentas en etapas avanzadas (opp, won, lost)
  // También incluir SQLs para mostrar el flujo completo
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*")
    .in("stage", ["sql", "opp", "won", "lost"])
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching pipeline deals:", error)
    throw error
  }
  
  // Obtener team members separadamente
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("id, user_id, name, role, sales_role")
  
  const teamMap = new Map<string, any>()
  teamMembers?.forEach(tm => {
    teamMap.set(tm.id, tm)
    if (tm.user_id) teamMap.set(tm.user_id, tm)
  })

  // Obtener la última actividad de cada cuenta
  const { data: activities } = await supabase
    .from("activities")
    .select("account_id, type, created_at, description")
    .order("created_at", { ascending: false })

  // Crear mapa de última actividad por cuenta
  const lastActivityMap = new Map<string, { type: string; date: string; description: string }>()
  if (activities) {
    for (const activity of activities) {
      if (!lastActivityMap.has(activity.account_id)) {
        lastActivityMap.set(activity.account_id, {
          type: activity.type || "nota",
          date: activity.created_at,
          description: activity.description || ""
        })
      }
    }
  }

  // Mapear stage de account a stage de pipeline
  function mapAccountStageToPipeline(accountStage: string): OpportunityStage {
    switch (accountStage) {
      case "sql":
        return "primera_reunion_programada"
      case "opp":
        return "primera_reunion_realizada"
      case "won":
        return "won"
      case "lost":
        return "lost"
      default:
        return "primera_reunion_programada"
    }
  }

  // Transformar cuentas a PipelineDeal
  const deals: PipelineDeal[] = (accounts || []).map((account: any) => {
    const owner = account.owner_id ? teamMap.get(account.owner_id) : null
    const stage = mapAccountStageToPipeline(account.stage)
    
    // Determinar next action
    let nextAction = null
    if (account.next_action && account.next_action_date) {
      nextAction = {
        type: account.next_action.toLowerCase().includes("reunion") ? "reunion" :
              account.next_action.toLowerCase().includes("demo") ? "demo" :
              account.next_action.toLowerCase().includes("llamada") ? "llamada" :
              account.next_action.toLowerCase().includes("propuesta") ? "propuesta" :
              "seguimiento",
        date: account.next_action_date,
        description: account.next_action
      }
    }

    // Obtener última actividad
    const lastActivity = lastActivityMap.get(account.id) || null

    return {
      id: account.id,
      accountId: account.id,
      accountName: account.name || "Sin nombre",
      accountCity: account.city || null,
      country: account.country_code,
      stage,
      ownerId: account.owner_id || null,
      ownerName: owner?.name || null,
      ownerRole: owner?.sales_role === "SDR" || owner?.sales_role === "AE" ? owner.sales_role : null,
      mrr: account.mrr || 0,
      currency: "USD" as const,
      icpTier: (account.fit_comercial === "alto" ? "A" : account.fit_comercial === "medio" ? "B" : "C") as "A" | "B" | "C",
      nextAction,
      lastActivity,
      createdAt: account.created_at,
      updatedAt: account.updated_at || account.created_at,
      expectedCloseDate: null,
      probability: account.probability || 0,
      status: getStatusFromStage(stage),
      lostReason: undefined,
      source: (account.source || "outbound") as "inbound" | "outbound" | "referido",
      stuckDays: calculateStuckDays(account.updated_at || account.created_at),
      product: null
    }
  })

  return deals
}

// Obtener miembros del equipo para filtros
export async function getPipelineTeamMembers(): Promise<PipelineTeamMember[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, role")
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching team members:", error)
    throw error
  }

  return (data || []).map((member: any) => ({
    id: member.id,
    name: member.name,
    role: member.role === "SDR" || member.role === "AE" ? member.role : "AE",
    avatar: null
  }))
}

// Actualizar stage de un deal
export async function updateDealStage(
  dealId: string, 
  newStage: OpportunityStage,
  lostReason?: string
): Promise<void> {
  const supabase = createAdminClient()
  
  const updates: Record<string, any> = {
    stage: newStage,
    updated_at: new Date().toISOString()
  }

  // Si es won o lost, agregar closed_at
  if (newStage === "won" || newStage === "lost") {
    updates.closed_at = new Date().toISOString()
  }

  // Si es lost, agregar razón
  if (newStage === "lost" && lostReason) {
    updates.lost_reason = lostReason
  }

  const { error } = await supabase
    .from("opportunities")
    .update(updates)
    .eq("id", dealId)

  if (error) {
    console.error("Error updating deal stage:", error)
    throw error
  }

  revalidatePath("/all/pipeline")
}

// Marcar acción como completada
export async function markActionComplete(dealId: string): Promise<void> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from("opportunities")
    .update({
      next_step: null,
      next_step_date: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", dealId)

  if (error) {
    console.error("Error marking action complete:", error)
    throw error
  }

  revalidatePath("/all/pipeline")
}

// Obtener países activos
export async function getPipelineCountries(): Promise<{ code: string; name: string }[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from("countries")
    .select("code, name")
    .eq("active", true)
    .order("name")

  if (error) {
    console.error("Error fetching countries:", error)
    throw error
  }

  return data || []
}
