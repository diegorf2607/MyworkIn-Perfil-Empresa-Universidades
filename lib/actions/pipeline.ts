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
export async function getPipelineDeals(): Promise<PipelineDeal[]> {
  noStore()
  const supabase = createAdminClient()
  
  // Obtener oportunidades con info de cuenta y owner
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      accounts(id, name, city, country_code, icp_fit, owner_id, source, next_action, next_action_date),
      team_members:owner_id(id, name, role)
    `)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching pipeline deals:", error)
    throw error
  }

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

  // Transformar oportunidades a PipelineDeal
  const deals: PipelineDeal[] = (opportunities || []).map((opp: any) => {
    const account = opp.accounts
    const owner = opp.team_members
    const stage = mapLegacyStage(opp.stage)
    
    // Determinar next action
    let nextAction = null
    if (opp.next_step && opp.next_step_date) {
      nextAction = {
        type: opp.next_step.includes("reunion") || opp.next_step.includes("Reunion") ? "reunion" :
              opp.next_step.includes("demo") || opp.next_step.includes("Demo") ? "demo" :
              opp.next_step.includes("llamada") || opp.next_step.includes("Llamada") ? "llamada" :
              opp.next_step.includes("propuesta") || opp.next_step.includes("Propuesta") ? "propuesta" :
              "seguimiento",
        date: opp.next_step_date,
        description: opp.next_step
      }
    } else if (account?.next_action && account?.next_action_date) {
      nextAction = {
        type: account.next_action.includes("reunion") || account.next_action.includes("Reunion") ? "reunion" :
              account.next_action.includes("demo") || account.next_action.includes("Demo") ? "demo" :
              account.next_action.includes("llamada") || account.next_action.includes("Llamada") ? "llamada" :
              "seguimiento",
        date: account.next_action_date,
        description: account.next_action
      }
    }

    // Obtener última actividad
    const lastActivity = lastActivityMap.get(opp.account_id) || null

    return {
      id: opp.id,
      accountId: opp.account_id,
      accountName: account?.name || "Sin nombre",
      accountCity: account?.city || null,
      country: opp.country_code,
      stage,
      ownerId: opp.owner_id || account?.owner_id || null,
      ownerName: owner?.name || null,
      ownerRole: owner?.role === "SDR" || owner?.role === "AE" ? owner.role : null,
      mrr: opp.mrr || 0,
      currency: "USD" as const,
      icpTier: (opp.icp_tier || account?.icp_fit === 5 ? "A" : account?.icp_fit >= 3 ? "B" : "C") as "A" | "B" | "C",
      nextAction,
      lastActivity,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at || opp.created_at,
      expectedCloseDate: opp.expected_close_date || null,
      probability: opp.probability || 0,
      status: getStatusFromStage(stage),
      lostReason: opp.lost_reason || undefined,
      source: (opp.source || account?.source || "outbound") as "inbound" | "outbound" | "referido",
      stuckDays: calculateStuckDays(opp.updated_at || opp.created_at),
      product: opp.product || null
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
