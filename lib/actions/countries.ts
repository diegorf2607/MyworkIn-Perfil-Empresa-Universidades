"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { type WorkspaceId, DEFAULT_WORKSPACE } from "@/lib/config/workspaces"

interface Country {
  code: string
  name: string
  active: boolean
}

/**
 * Get all countries for a workspace (using workspace_countries table)
 */
export async function getCountries(workspaceId: WorkspaceId = DEFAULT_WORKSPACE): Promise<Country[]> {
  noStore()
  
  try {
    const supabase = createAdminClient()
    
    // Join countries with workspace_countries to get workspace-specific data
    const { data, error } = await supabase
      .from("workspace_countries" as any)
      .select(`
        country_code,
        active,
        countries!inner (
          code,
          name
        )
      `)
      .eq("workspace_id", workspaceId)
      .order("country_code")

    if (error) {
      // If workspace_countries table doesn't exist yet, fallback to legacy behavior
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.log("workspace_countries table not found, using legacy query")
        return getCountriesLegacy(workspaceId)
      }
      console.error("Error fetching countries:", error)
      throw error
    }

    // Transform the data to match the expected Country interface
    return ((data as any[]) || []).map((row) => ({
      code: row.country_code,
      name: row.countries?.name || row.country_code,
      active: row.active
    }))
  } catch (error) {
    console.error("Failed to get countries:", error)
    return []
  }
}

/**
 * Legacy function for backwards compatibility (before workspace_countries migration)
 */
async function getCountriesLegacy(workspaceId: WorkspaceId): Promise<Country[]> {
  const supabase = createAdminClient()
  let query = supabase.from("countries").select("code, name, active")
  
  // Check if workspace_id column exists by trying to filter
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }

  const { data, error } = await query.order("name")

  if (error) {
    console.error("Error in legacy getCountries:", error)
    return []
  }
  
  return ((data as any[]) || []).map((c) => ({
    code: c.code,
    name: c.name,
    active: c.active ?? true
  }))
}

/**
 * Get active countries for a workspace
 */
export async function getActiveCountries(workspaceId: WorkspaceId = DEFAULT_WORKSPACE): Promise<Country[]> {
  noStore()
  
  const supabase = createAdminClient()
  
  // Try new workspace_countries table first
  const { data, error } = await supabase
    .from("workspace_countries" as any)
    .select(`
      country_code,
      active,
      countries!inner (
        code,
        name
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("active", true)
    .order("country_code")

  if (error) {
    // Fallback to legacy behavior
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      const allCountries = await getCountriesLegacy(workspaceId)
      return allCountries.filter(c => c.active)
    }
    console.error("Error in getActiveCountries:", error)
    throw error
  }
  
  return ((data as any[]) || []).map((row) => ({
    code: row.country_code,
    name: row.countries?.name || row.country_code,
    active: row.active
  }))
}

/**
 * Get a specific country by code for a workspace
 */
export async function getCountryByCode(code: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE): Promise<Country | null> {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()
  
  const { data, error } = await supabase
    .from("workspace_countries" as any)
    .select(`
      country_code,
      active,
      countries!inner (
        code,
        name
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("country_code", codeUpper)
    .single()

  if (error) {
    // Fallback to legacy behavior or return null if not found
    if (error.code === "PGRST116") return null // Not found
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      // Legacy fallback
      const legacyResult = await supabase
        .from("countries")
        .select("code, name, active")
        .eq("code", codeUpper)
        .single()
      
      if (legacyResult.error) return null
      const legacyData = legacyResult.data as any
      return legacyData ? {
        code: legacyData.code,
        name: legacyData.name,
        active: legacyData.active ?? true
      } : null
    }
    throw error
  }
  
  const row = data as any
  return row ? {
    code: row.country_code,
    name: row.countries?.name || row.country_code,
    active: row.active
  } : null
}

/**
 * Add a country to a workspace
 * First ensures the country exists in the global countries table,
 * then adds/updates the workspace_countries assignment
 */
export async function addCountry(code: string, name: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()

  // Step 1: Ensure country exists in global countries table
  const { error: countryError } = await supabase
    .from("countries")
    .upsert(
      { code: codeUpper, name, active: true } as any,
      { onConflict: "code" }
    )

  if (countryError) {
    console.error("Error upserting country:", countryError)
    throw countryError
  }

  // Step 2: Add/update workspace_countries assignment
  const { data, error: wsError } = await supabase
    .from("workspace_countries" as any)
    .upsert(
      { workspace_id: workspaceId, country_code: codeUpper, active: true } as any,
      { onConflict: "workspace_id,country_code" }
    )
    .select()
    .single()

  if (wsError) {
    // If workspace_countries doesn't exist, the migration hasn't run yet
    if (wsError.code === "42P01" || wsError.message?.includes("does not exist")) {
      console.log("workspace_countries table not found, country added to countries table only")
      revalidatePath("/countries")
      revalidatePath(`/c/${codeUpper}`)
      revalidatePath(`/c/${codeUpper}/scorecards`)
      return { code: codeUpper, name, active: true }
    }
    throw wsError
  }

  revalidatePath("/countries")
  revalidatePath(`/c/${codeUpper}`)
  revalidatePath(`/c/${codeUpper}/scorecards`)

  return { code: codeUpper, name, active: true }
}

/**
 * Update a country's properties for a workspace
 */
export async function updateCountry(code: string, updates: { name?: string; active?: boolean }, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()
  
  // Update name in global countries table if provided
  if (updates.name !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: nameError } = await (supabase as any)
      .from("countries")
      .update({ name: updates.name })
      .eq("code", codeUpper)
    
    if (nameError) {
      console.error("Error updating country name:", nameError)
      throw nameError
    }
  }

  // Update active status in workspace_countries
  if (updates.active !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: wsError } = await (supabase as any)
      .from("workspace_countries")
      .update({ active: updates.active })
      .eq("workspace_id", workspaceId)
      .eq("country_code", codeUpper)

    if (wsError) {
      // Fallback to legacy behavior
      if (wsError.code === "42P01" || wsError.message?.includes("does not exist")) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: legacyError } = await (supabase as any)
          .from("countries")
          .update({ active: updates.active })
          .eq("code", codeUpper)
        
        if (legacyError) throw legacyError
      } else {
        throw wsError
      }
    }
  }

  revalidatePath("/countries")
  revalidatePath(`/c/${code}`)
  revalidatePath(`/c/${code}/scorecards`)

  return { code: codeUpper, ...updates }
}

/**
 * Remove a country from a workspace (doesn't delete from global countries table)
 */
export async function deleteCountry(code: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()
  
  // Delete from workspace_countries (not from global countries table)
  const { error } = await supabase
    .from("workspace_countries" as any)
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("country_code", codeUpper)

  if (error) {
    // Fallback to legacy behavior - but be careful not to delete from countries table
    // as it would break FK constraints
    if (error.code === "42P01" || error.message?.includes("does not exist")) {
      // In legacy mode, just deactivate instead of deleting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("countries")
        .update({ active: false })
        .eq("code", codeUpper)
      
      if (updateError) throw updateError
    } else {
      throw error
    }
  }

  revalidatePath("/countries")
}
