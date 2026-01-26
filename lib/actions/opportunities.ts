"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type OpportunityInsert = {
  account_id: string
  country_code: string
  product?: string
  stage?: "discovery" | "demo" | "propuesta" | "negociacion" | "won" | "lost"
  probability?: number
  mrr?: number
  next_step?: string
  next_step_date?: string
  lost_reason?: string
}

export type OpportunityUpdate = Partial<OpportunityInsert> & { id: string }

export async function getOpportunities(countryCode?: string) {
  // Use admin client to bypass RLS for read operations
  const supabase = createAdminClient()
  let query = supabase.from("opportunities").select("*, accounts(name, city)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getOpportunitiesByStage(countryCode: string, stages: string[]) {
  const supabase = await createClient()
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
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createOpportunity(opportunity: OpportunityInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("opportunities").insert(opportunity).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateOpportunity(update: OpportunityUpdate) {
  const supabase = await createClient()
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
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
