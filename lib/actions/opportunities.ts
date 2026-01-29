"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { type WorkspaceId, DEFAULT_WORKSPACE } from "@/lib/config/workspaces"

export type OpportunityStage = 
  | "primera_reunion_programada"
  | "primera_reunion_realizada" 
  | "demo_programada"
  | "propuesta_enviada"
  | "negociacion"
  | "won"
  | "lost"
  | "nurture"
  // Legacy stages (for backwards compatibility)
  | "discovery"
  | "demo"
  | "propuesta"

export type OpportunityInsert = {
  account_id: string
  country_code: string
  product?: string
  stage?: OpportunityStage
  probability?: number
  mrr?: number
  next_step?: string
  next_step_date?: string
  lost_reason?: string
  owner_id?: string
  source?: "inbound" | "outbound" | "referido"
  icp_tier?: "A" | "B" | "C"
  expected_close_date?: string
  workspace_id?: WorkspaceId
}

export type OpportunityUpdate = Partial<OpportunityInsert> & { id: string }

export async function getOpportunities(countryCode?: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  // Disable caching - always fetch fresh data
  noStore()
  
  // Use admin client to bypass RLS for read operations
  const supabase = createAdminClient()
  let query = supabase.from("opportunities").select("*, accounts(name, city)")
    .eq("workspace_id", workspaceId) // Filter by workspace

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getOpportunitiesByStage(countryCode: string, stages: string[]) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("opportunities")
    .select("*, accounts(name, city)")
    .eq("country_code", countryCode)
    .in("stage", stages)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getOpportunitiesByAccount(accountId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createOpportunity(opportunity: OpportunityInsert) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("opportunities").insert(opportunity).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateOpportunity(update: OpportunityUpdate) {
  const supabase = createAdminClient()
  const { id, ...updates } = update

  // If closing opportunity, set closed_at
  if (updates.stage === "won" || updates.stage === "lost") {
    ;(updates as Record<string, unknown>).closed_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("opportunities").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteOpportunity(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("opportunities").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
