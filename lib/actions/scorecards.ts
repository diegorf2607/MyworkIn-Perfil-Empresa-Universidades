"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ScorecardInsert = {
  country_code: string
  date: string
  cash_collected?: number
  mrr_generated?: number
  universities_won?: number
  new_sqls?: number
  meetings_done?: number
  new_icp_accounts?: number
}

export type ScorecardUpdate = Partial<ScorecardInsert> & { id: string }

export async function getScorecards(countryCode: string, startDate?: string, endDate?: string) {
  const supabase = await createClient()
  let query = supabase.from("scorecards").select("*").eq("country_code", countryCode)

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (error) throw error
  return data
}

export async function upsertScorecard(scorecard: ScorecardInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scorecards")
    .upsert(scorecard, { onConflict: "country_code,date" })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateScorecard(update: ScorecardUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("scorecards").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}
