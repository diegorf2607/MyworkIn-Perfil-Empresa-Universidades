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
// Combina accounts (sql, opp) + opportunities (won, lost con MRR)
export async function getPipelineDeals(workspaceId?: string): Promise<PipelineDeal[]> {
  noStore()
  const supabase = createAdminClient()
  
  // 1. Obtener cuentas en etapas sql y opp
  // For mkn: only include data explicitly marked with workspace_id = 'mkn'
  // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
  let accountsQuery = supabase
    .from("accounts")
    .select("*")
    .in("stage", ["sql", "opp"])
    .order("updated_at", { ascending: false })
  
  // Filtrar por workspace - solo para MKN
  if (workspaceId === "mkn") {
    accountsQuery = accountsQuery.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data: accounts, error: accError } = await accountsQuery

  if (accError) {
    console.error("Error fetching accounts:", accError)
    throw accError
  }

  // 2. Obtener opportunities won y lost (tienen MRR)
  let oppsQuery = supabase
    .from("opportunities")
    .select("*, accounts(id, name, city, country_code, owner_id, source, fit_comercial)")
    .in("stage", ["won", "lost"])
    .order("updated_at", { ascending: false })
  
  // Filtrar por workspace - solo para MKN
  if (workspaceId === "mkn") {
    oppsQuery = oppsQuery.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data: opportunities, error: oppsError } = await oppsQuery

  if (oppsError) {
    console.error("Error fetching opportunities:", oppsError)
    // No throw, just continue with accounts only
  }
  
  // Obtener team members
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
      default:
        return "primera_reunion_programada"
    }
  }

  // Transformar ACCOUNTS a PipelineDeal (sql, opp)
  const accountDeals: PipelineDeal[] = (accounts || []).map((account: any) => {
    const owner = account.owner_id ? teamMap.get(account.owner_id) : null
    const stage = mapAccountStageToPipeline(account.stage)
    const lastActivity = lastActivityMap.get(account.id) || null

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

    return {
      id: `acc_${account.id}`, // Prefijo para identificar que es account
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

  // Transformar OPPORTUNITIES a PipelineDeal (won, lost)
  const oppDeals: PipelineDeal[] = (opportunities || []).map((opp: any) => {
    const account = opp.accounts
    const owner = account?.owner_id ? teamMap.get(account.owner_id) : null
    const lastActivity = account ? lastActivityMap.get(account.id) : null

    return {
      id: `opp_${opp.id}`, // Prefijo para identificar que es opportunity
      accountId: account?.id || opp.account_id,
      accountName: account?.name || "Sin nombre",
      accountCity: account?.city || null,
      country: opp.country_code,
      stage: opp.stage as OpportunityStage,
      ownerId: account?.owner_id || null,
      ownerName: owner?.name || null,
      ownerRole: owner?.sales_role === "SDR" || owner?.sales_role === "AE" ? owner.sales_role : null,
      mrr: opp.mrr || 0,
      currency: "USD" as const,
      icpTier: (account?.fit_comercial === "alto" ? "A" : account?.fit_comercial === "medio" ? "B" : "C") as "A" | "B" | "C",
      nextAction: null,
      lastActivity,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at || opp.created_at,
      expectedCloseDate: opp.expected_close_date || null,
      probability: opp.probability || 0,
      status: opp.stage === "won" ? "won" : "lost",
      lostReason: opp.lost_reason || undefined,
      source: (opp.source || account?.source || "outbound") as "inbound" | "outbound" | "referido",
      stuckDays: 0,
      product: opp.product || null
    }
  })

  return [...accountDeals, ...oppDeals]
}

// Obtener miembros del equipo para filtros
export async function getPipelineTeamMembers(workspaceId?: string): Promise<PipelineTeamMember[]> {
  const supabase = createAdminClient()
  
  let query = supabase
    .from("team_members")
    .select("id, name, role")
    .eq("is_active", true)
    .order("name")

  // Filtrar por workspace - solo para MKN
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data, error } = await query

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

// Mapear stage de pipeline a stage de account
function mapPipelineStageToAccount(pipelineStage: OpportunityStage): string {
  switch (pipelineStage) {
    case "primera_reunion_programada":
      return "sql"
    case "primera_reunion_realizada":
    case "demo_programada":
    case "propuesta_enviada":
    case "negociacion":
      return "opp"
    case "won":
      return "won"
    case "lost":
      return "lost"
    case "nurture":
      return "sql" // nurture vuelve a sql
    default:
      return "sql"
  }
}

// Actualizar stage de un deal
export async function updateDealStage(
  dealId: string, 
  newStage: OpportunityStage,
  lostReason?: string
): Promise<void> {
  const supabase = createAdminClient()
  
  // Determinar si es account o opportunity por el prefijo
  const isAccount = dealId.startsWith("acc_")
  const isOpportunity = dealId.startsWith("opp_")
  const realId = dealId.replace(/^(acc_|opp_)/, "")

  if (isAccount) {
    // Actualizar account
    const accountStage = mapPipelineStageToAccount(newStage)
    
    const updates: Record<string, any> = {
      stage: accountStage,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", realId)

    if (error) {
      console.error("Error updating account stage:", error)
      throw error
    }

    // Si es won o lost, crear una opportunity
    if (newStage === "won" || newStage === "lost") {
      // Obtener datos del account para crear opportunity
      const { data: account } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", realId)
        .single()

      if (account) {
        const oppData: Record<string, any> = {
          account_id: realId,
          country_code: account.country_code,
          stage: newStage,
          mrr: account.mrr || 0,
          probability: newStage === "won" ? 100 : 0,
          source: account.source || "outbound",
          closed_at: new Date().toISOString()
        }

        if (newStage === "lost" && lostReason) {
          oppData.lost_reason = lostReason
        }

        await supabase.from("opportunities").insert(oppData)
      }
    }
  } else if (isOpportunity) {
    // Actualizar opportunity existente
    const updates: Record<string, any> = {
      stage: newStage,
      updated_at: new Date().toISOString()
    }

    if (newStage === "won" || newStage === "lost") {
      updates.closed_at = new Date().toISOString()
    }

    if (newStage === "lost" && lostReason) {
      updates.lost_reason = lostReason
    }

    const { error } = await supabase
      .from("opportunities")
      .update(updates)
      .eq("id", realId)

    if (error) {
      console.error("Error updating opportunity stage:", error)
      throw error
    }
  } else {
    // Fallback: intentar como account sin prefijo
    const accountStage = mapPipelineStageToAccount(newStage)
    
    const { error } = await supabase
      .from("accounts")
      .update({ stage: accountStage, updated_at: new Date().toISOString() })
      .eq("id", dealId)

    if (error) {
      console.error("Error updating deal stage (fallback):", error)
      throw error
    }
  }

  revalidatePath("/all/pipeline")
}

// Actualizar stage de un deal CON seguimiento
export async function updateDealStageWithFollowUp(
  dealId: string, 
  newStage: OpportunityStage,
  followUp: { type: string; date: string; description: string }
): Promise<void> {
  const supabase = createAdminClient()
  
  // Determinar si es account o opportunity por el prefijo
  const isAccount = dealId.startsWith("acc_")
  const realId = dealId.replace(/^(acc_|opp_)/, "")

  if (isAccount) {
    // Actualizar account con stage y seguimiento
    const accountStage = mapPipelineStageToAccount(newStage)
    
    const updates: Record<string, any> = {
      stage: accountStage,
      next_action: followUp.description || followUp.type,
      next_action_date: followUp.date,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", realId)

    if (error) {
      console.error("Error updating account with followup:", error)
      throw error
    }
  } else {
    // Actualizar opportunity con stage y seguimiento
    const updates: Record<string, any> = {
      stage: newStage,
      next_step: followUp.description || followUp.type,
      next_step_date: followUp.date,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("opportunities")
      .update(updates)
      .eq("id", realId)

    if (error) {
      console.error("Error updating opportunity with followup:", error)
      throw error
    }
  }

  revalidatePath("/all/pipeline")
}

// Marcar acción como completada
export async function markActionComplete(dealId: string): Promise<void> {
  const supabase = createAdminClient()
  
  // Determinar si es account o opportunity por el prefijo
  const isAccount = dealId.startsWith("acc_")
  const realId = dealId.replace(/^(acc_|opp_)/, "")

  if (isAccount) {
    const { error } = await supabase
      .from("accounts")
      .update({
        next_action: null,
        next_action_date: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", realId)

    if (error) {
      console.error("Error marking action complete:", error)
      throw error
    }
  } else {
    const { error } = await supabase
      .from("opportunities")
      .update({
        next_step: null,
        next_step_date: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", realId)

    if (error) {
      console.error("Error marking action complete:", error)
      throw error
    }
  }

  revalidatePath("/all/pipeline")
}

// Obtener países activos
export async function getPipelineCountries(workspaceId?: string): Promise<{ code: string; name: string }[]> {
  const supabase = createAdminClient()
  
  let query = supabase
    .from("countries")
    .select("code, name")
    .eq("active", true)
    .order("name")

  // Filtrar por workspace - solo para MKN
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data, error } = await query

  if (error) {
    console.error("Error fetching countries:", error)
    throw error
  }

  return data || []
}
