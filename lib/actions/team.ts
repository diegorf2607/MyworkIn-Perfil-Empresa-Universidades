"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type TeamMemberInsert = {
  name: string
  email: string
  role: "SDR" | "AE"
  country_codes?: string[] // Now accepts array of country codes
}

export type TeamMemberUpdate = Partial<Omit<TeamMemberInsert, "country_codes">> & {
  id: string
  country_codes?: string[]
}

export async function getTeamMembers(countryCode?: string) {
  const supabase = await createClient()

  // Get all team members
  const { data: members, error: membersError } = await supabase.from("team_members").select("*").order("name")

  if (membersError) throw membersError

  // Get all country assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from("team_member_countries")
    .select("member_id, country_code")

  if (assignmentsError) {
    // Table might not exist yet, return members without countries
    console.warn("team_member_countries table not found, returning members without country assignments")
    return members?.map((m) => ({ ...m, country_codes: [] })) || []
  }

  // Combine members with their countries
  const membersWithCountries =
    members?.map((member) => ({
      ...member,
      country_codes: assignments?.filter((a) => a.member_id === member.id).map((a) => a.country_code) || [],
    })) || []

  // Filter by country if specified
  if (countryCode) {
    return membersWithCountries.filter((m) => m.country_codes.includes(countryCode) || m.country_codes.length === 0)
  }

  return membersWithCountries
}

export async function getActiveTeamMembersByCountry(countryCode: string) {
  const supabase = await createClient()

  // Get active team members
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("name")

  if (membersError) throw membersError

  // Get assignments for this country
  const { data: assignments, error: assignmentsError } = await supabase
    .from("team_member_countries")
    .select("member_id")
    .eq("country_code", countryCode)

  if (assignmentsError) {
    // Table might not exist yet
    return members || []
  }

  const memberIds = assignments?.map((a) => a.member_id) || []

  // Return only members assigned to this country
  return members?.filter((m) => memberIds.includes(m.id)) || []
}

export async function createTeamMember(member: TeamMemberInsert) {
  const supabase = await createClient()
  const { country_codes, ...memberData } = member

  // Insert team member
  const { data, error } = await supabase
    .from("team_members")
    .insert({ ...memberData, is_active: true })
    .select()
    .single()

  if (error) throw error

  if (country_codes && country_codes.length > 0 && data) {
    const countryAssignments = country_codes.map((code) => ({
      member_id: data.id,
      country_code: code,
    }))

    const { error: assignError } = await supabase.from("team_member_countries").insert(countryAssignments)

    if (assignError) {
      console.warn("Error assigning countries:", assignError)
    }
  }

  revalidatePath("/")
  return { ...data, country_codes: country_codes || [] }
}

export async function updateTeamMember(update: TeamMemberUpdate) {
  const supabase = await createClient()
  const { id, country_codes, ...updates } = update

  // Update team member
  const { data, error } = await supabase.from("team_members").update(updates).eq("id", id).select().single()

  if (error) throw error

  if (country_codes !== undefined) {
    // Delete existing assignments
    await supabase.from("team_member_countries").delete().eq("member_id", id)

    // Insert new assignments
    if (country_codes.length > 0) {
      const countryAssignments = country_codes.map((code) => ({
        member_id: id,
        country_code: code,
      }))

      await supabase.from("team_member_countries").insert(countryAssignments)
    }
  }

  revalidatePath("/")
  return { ...data, country_codes: country_codes || [] }
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()

  // Country assignments will be deleted automatically via CASCADE
  const { error } = await supabase.from("team_members").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function toggleTeamMemberActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_members")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}
