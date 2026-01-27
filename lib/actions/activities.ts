"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type ActivityInsert = {
  country_code: string
  account_id: string
  type:
    | "email"
    | "llamada"
    | "reunión"
    | "nota"
    | "linkedin"
    | "whatsapp"
    | "meeting"
    | "note"
    | "account_created"
    | "stage_changed"
    | "kdm_created"
    | "kdm_linked"
    | "fit_changed"
  date_time?: string
  owner_id?: string
  summary?: string
  subject?: string
  requires_follow_up?: boolean
  details?: Record<string, unknown>
}

export type ActivityUpdate = Partial<ActivityInsert> & { id: string }

export async function getActivitiesByAccount(accountId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*, team_members(name)")
    .eq("account_id", accountId)
    .order("date_time", { ascending: false })

  if (error) throw error
  return data
}

export async function getActivitiesByCountry(countryCode: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .select("*, accounts(name), team_members(name)")
    .eq("country_code", countryCode)
    .order("date_time", { ascending: false })

  if (error) throw error
  return data
}

export async function createActivity(activity: ActivityInsert) {
  const supabase = createAdminClient()
  const activityDateTime = activity.date_time || new Date().toISOString()

  const { data, error } = await supabase
    .from("activities")
    .insert({ ...activity, date_time: activityDateTime })
    .select()
    .single()

  if (error) {
    throw error
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("first_contact_at, last_contact_at")
    .eq("id", activity.account_id)
    .single()

  const updates: Record<string, string | null> = {
    last_touch: activityDateTime,
  }

  if (!account?.first_contact_at) {
    updates.first_contact_at = activityDateTime
  }

  if (!account?.last_contact_at || new Date(activityDateTime) > new Date(account.last_contact_at)) {
    updates.last_contact_at = activityDateTime
  }

  await supabase.from("accounts").update(updates).eq("id", activity.account_id)

  revalidatePath("/")
  return data
}

export async function updateActivity(update: ActivityUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("activities").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteActivity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
