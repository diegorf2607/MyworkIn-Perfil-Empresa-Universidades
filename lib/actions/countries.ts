"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { type WorkspaceId, DEFAULT_WORKSPACE } from "@/lib/config/workspaces"

export async function getCountries(workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  // Disable caching - always fetch fresh data
  noStore()
  
  try {
    // Use admin client to bypass RLS - countries are public data within the app
    const supabase = createAdminClient()
    let query = supabase.from("countries").select("*")
    
    // For mkn: only include data explicitly marked with workspace_id = 'mkn'
    // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
    if (workspaceId === "mkn") {
      query = query.eq("workspace_id", "mkn")
    }
    // No filter for myworkin - includes all existing/legacy data

    const { data, error } = await query.order("name")

    if (error) {
      console.error("Error fetching countries:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Failed to get countries:", error)
    // Return empty array instead of throwing to prevent page crash
    return []
  }
}

export async function getActiveCountries(workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  // Disable caching - always fetch fresh data
  noStore()
  
  // Use admin client to bypass RLS - countries are public data within the app
  const supabase = createAdminClient()
  
  // Get countries where active is true or not set (default to active)
  // For mkn: only include data explicitly marked with workspace_id = 'mkn'
  // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
  let query = supabase
    .from("countries")
    .select("*")
    .or("active.eq.true,active.is.null")
  
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data, error } = await query.order("name")

  if (error) {
    console.error("Error in getActiveCountries:", error)
    throw error
  }
  
  return data || []
}

export async function getCountryByCode(code: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  // Use admin client to bypass RLS - countries are public data within the app
  const supabase = createAdminClient()
  
  let query = supabase.from("countries").select("*").eq("code", code.toUpperCase())
  
  // For mkn: only include data explicitly marked with workspace_id = 'mkn'
  // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data, error } = await query.single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function addCountry(code: string, name: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()

  // Use composite key conflict resolution (code + workspace_id)
  // This allows the same country code to exist in different workspaces
  const { data, error } = await supabase
    .from("countries")
    .upsert(
      { code: codeUpper, name, active: true, workspace_id: workspaceId }, 
      { onConflict: "code,workspace_id" }
    )
    .select()
    .single()

  if (error) throw error

  revalidatePath("/countries")
  revalidatePath(`/c/${codeUpper}`)
  revalidatePath(`/c/${codeUpper}/scorecards`)

  return data
}

export async function updateCountry(code: string, updates: { name?: string; active?: boolean }, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("countries")
    .update(updates)
    .eq("code", code.toUpperCase())
    .eq("workspace_id", workspaceId)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/countries")
  revalidatePath(`/c/${code}`)
  revalidatePath(`/c/${code}/scorecards`)

  return data
}

export async function deleteCountry(code: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("countries")
    .delete()
    .eq("code", code.toUpperCase())
    .eq("workspace_id", workspaceId)

  if (error) throw error
  revalidatePath("/countries")
}
