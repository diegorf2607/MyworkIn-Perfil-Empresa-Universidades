"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { createActivity } from "./activities"

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
  contact_name?: string
  contact_email?: string
  next_step_type?: "waiting_response" | "new_meeting" | "send_proposal" | "internal_review" | "general_follow_up"
  next_step_date?: string
  next_step_responsible?: "myworkin" | "university"
}

export type MeetingUpdate = Partial<MeetingInsert> & {
  id: string
  outcome_changed_at?: string
  post_meeting_sent_at?: string
  had_progress?: boolean
  progress_at?: string
  follow_up_status?: "active" | "cancelled" | "alert_sent" | "resolved"
}

export async function getMeetings(countryCode?: string) {
  // Disable caching - always fetch fresh data
  noStore()
  
  try {
    // Use admin client to bypass RLS for read operations
    const supabase = createAdminClient()
    // Simplified query - removed team_members join that may not exist
    let query = supabase.from("meetings").select("*, accounts(name, city)")

    if (countryCode) {
      query = query.eq("country_code", countryCode)
    }

    const { data, error } = await query.order("date_time", { ascending: false })

    if (error) {
      console.error("Error fetching meetings:", error)
      return []
    }
    return data
  } catch (error) {
    console.error("Failed to get meetings:", error)
    return []
  }
}

export async function getMeetingsByAccount(accountId: string) {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("account_id", accountId)
    .order("date_time", { ascending: false })

  if (error) throw error
  return data
}

export async function createMeeting(meeting: MeetingInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("meetings").insert(meeting).select().single()

  if (error) throw error

  try {
    await createActivity({
      account_id: meeting.account_id,
      country_code: meeting.country_code,
      type: "meeting",
      owner_id: meeting.owner_id,
      summary: `Reunión ${meeting.kind} agendada${meeting.contact_name ? ` con ${meeting.contact_name}` : ""} para ${new Date(meeting.date_time).toLocaleDateString("es-ES")}`,
      date_time: new Date().toISOString(), // Use current time, not meeting date
      details: {
        kind: meeting.kind,
        contact_name: meeting.contact_name,
        contact_email: meeting.contact_email,
        meeting_date: meeting.date_time, // Store actual meeting date in details
      },
    })
    console.log("[v0] Activity created for meeting:", data.id)
  } catch (e) {
    console.error("[v0] Error creating activity for meeting:", e)
  }

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
  if (meeting.next_step_date) {
    updates.next_follow_up_at = meeting.next_step_date
    updates.next_follow_up_label = meeting.next_step || `Post-${meeting.kind}`
  } else if (meeting.next_meeting_date) {
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

  const { accounts, team_members, ...validUpdates } = updates as Record<string, unknown>

  const { data, error } = await supabase.from("meetings").update(validUpdates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateMeetingOutcome(
  meetingId: string,
  newOutcome: "pending" | "no-show" | "done" | "next-step",
  currentOutcome: string,
) {
  const supabase = await createClient()

  // Only track if outcome actually changed from pending
  const updates: Record<string, unknown> = {
    outcome: newOutcome,
  }

  if (currentOutcome === "pending" && newOutcome !== "pending") {
    updates.outcome_changed_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("meetings").update(updates).eq("id", meetingId).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function markPostMeetingSent(meetingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meetings")
    .update({
      post_meeting_sent_at: new Date().toISOString(),
    })
    .eq("id", meetingId)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function markMeetingProgress(meetingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meetings")
    .update({
      had_progress: true,
      progress_at: new Date().toISOString(),
      follow_up_status: "resolved",
    })
    .eq("id", meetingId)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateFollowUpStatus(
  meetingId: string,
  status: "active" | "cancelled" | "alert_sent" | "resolved",
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("meetings")
    .update({ follow_up_status: status })
    .eq("id", meetingId)
    .select()
    .single()

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
