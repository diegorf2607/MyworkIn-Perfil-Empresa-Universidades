"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MeetingInsert = {
  country_code: string
  account_id: string
  date_time: string
  kind: "Discovery" | "Demo" | "Propuesta" | "Kickoff"
  owner_id?: string
  outcome?: "pending" | "no-show" | "done" | "next-step"
  notes?: string
  next_step?: string
  next_meeting_date?: string
}

export type MeetingUpdate = Partial<MeetingInsert> & { id: string }

export async function getMeetings(countryCode?: string) {
  const supabase = await createClient()
  let query = supabase.from("meetings").select("*, accounts(name, city), team_members(name)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("date_time", { ascending: false })

  if (error) throw error
  return data
}

export async function getMeetingsByAccount(accountId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("meetings")
    .select("*, team_members(name)")
    .eq("account_id", accountId)
    .order("date_time", { ascending: false })

  if (error) throw error
  return data
}

export async function createMeeting(meeting: MeetingInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("meetings").insert(meeting).select().single()

  if (error) throw error

  // Get current account data
  const { data: account } = await supabase
    .from("accounts")
    .select("first_contact_at, last_contact_at")
    .eq("id", meeting.account_id)
    .single()

  const updates: Record<string, string | null> = {}

  // Set first_contact_at if not set
  if (!account?.first_contact_at) {
    updates.first_contact_at = meeting.date_time
  }

  // Update last_contact_at if this meeting is more recent
  if (!account?.last_contact_at || new Date(meeting.date_time) > new Date(account.last_contact_at)) {
    updates.last_contact_at = meeting.date_time
  }

  // Set next follow-up based on meeting
  if (meeting.next_meeting_date) {
    updates.next_follow_up_at = meeting.next_meeting_date
    updates.next_follow_up_label = meeting.next_step || `Post-${meeting.kind}`
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("accounts").update(updates).eq("id", meeting.account_id)
  }

  revalidatePath("/")
  return data
}

export async function updateMeeting(update: MeetingUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("meetings").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("meetings").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
