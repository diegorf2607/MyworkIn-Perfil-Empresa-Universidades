"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export type TeamMemberInsert = {
  name: string
  email: string
  role: "admin" | "user"
  country_codes?: string[]
  is_active?: boolean
}

export type TeamMemberUpdate = Partial<Omit<TeamMemberInsert, "email">> & {
  id: string
  country_codes?: string[]
}

export async function getTeamMembers(countryCode?: string) {
  noStore()
  const supabase = createAdminClient()

  const { data: members, error: membersError } = await supabase.from("team_members").select("*").order("name")

  if (membersError) {
    console.error("Error in getTeamMembers:", membersError)
    return []
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("team_member_countries")
    .select("member_user_id, country_code")

  if (assignmentsError) {
    console.warn("team_member_countries table error:", assignmentsError)
    return members?.map((m) => ({ ...m, country_codes: [] })) || []
  }

  const membersWithCountries =
    members?.map((member) => ({
      ...member,
      country_codes: assignments?.filter((a) => a.member_user_id === member.user_id).map((a) => a.country_code) || [],
    })) || []

  // Filter by country if specified
  if (countryCode) {
    return membersWithCountries.filter(
      (m) => m.role === "admin" || m.country_codes.includes(countryCode) || m.country_codes.length === 0,
    )
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

  const { data: assignments, error: assignmentsError } = await supabase
    .from("team_member_countries")
    .select("member_user_id")
    .eq("country_code", countryCode)

  if (assignmentsError) {
    return members || []
  }

  const userIds = assignments?.map((a) => a.member_user_id) || []

  return members?.filter((m) => m.role === "admin" || userIds.includes(m.user_id)) || []
}

// This function is kept for backward compatibility but should not be used
export async function createTeamMember(member: TeamMemberInsert) {
  throw new Error("Use POST /api/team/members to create new team members")
}

export async function updateTeamMember(update: TeamMemberUpdate) {
  const supabase = await createClient()
  const { id, country_codes, ...updates } = update

  const { data, error } = await supabase.from("team_members").update(updates).eq("id", id).select("*").single()

  if (error) throw error

  if (country_codes !== undefined && data.user_id) {
    await supabase.from("team_member_countries").delete().eq("member_user_id", data.user_id)

    // Insert new assignments if role is user
    if (data.role === "user" && country_codes.length > 0) {
      const countryAssignments = country_codes.map((code) => ({
        member_user_id: data.user_id,
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

  const { data: member } = await supabase.from("team_members").select("user_id").eq("id", id).single()

  if (!member?.user_id) {
    throw new Error("Member not found")
  }

  // Delete team member (will cascade delete countries and auth user)
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

export async function isCurrentUserAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: member } = await supabase.from("team_members").select("role, is_active").eq("user_id", user.id).single()

  return member?.role === "admin" && member?.is_active === true
}

export async function getCurrentUserCountries() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: member } = await supabase.from("team_members").select("role").eq("user_id", user.id).single()

  if (member?.role === "admin") {
    // Admins see all countries
    const { data: countries } = await supabase.from("countries").select("code")
    return countries?.map((c) => c.code) || []
  }

  const { data: assignments } = await supabase
    .from("team_member_countries")
    .select("country_code")
    .eq("member_user_id", user.id)

  return assignments?.map((a) => a.country_code) || []
}
