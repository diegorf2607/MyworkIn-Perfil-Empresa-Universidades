"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type TeamMemberInsert = {
  name: string
  email: string
  role: "SDR" | "AE"
  country_code?: string
}

export type TeamMemberUpdate = Partial<TeamMemberInsert> & { id: string }

export async function getTeamMembers(countryCode?: string) {
  const supabase = await createClient()
  let query = supabase.from("team_members").select("*")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("name")

  if (error) throw error
  return data
}

export async function createTeamMember(member: TeamMemberInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("team_members").insert(member).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateTeamMember(update: TeamMemberUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("team_members").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("team_members").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
