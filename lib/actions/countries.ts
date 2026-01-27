"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function getCountries() {
  // Disable caching - always fetch fresh data
  noStore()
  
  try {
    // Use admin client to bypass RLS - countries are public data within the app
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("countries").select("*").order("name")

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

export async function getActiveCountries() {
  // Disable caching - always fetch fresh data
  noStore()
  
  // Use admin client to bypass RLS - countries are public data within the app
  const supabase = createAdminClient()
  
  // Get countries where active is true or not set (default to active)
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .or("active.eq.true,active.is.null")
    .order("name")

  if (error) {
    console.error("Error in getActiveCountries:", error)
    throw error
  }
  
  return data || []
}

export async function getCountryByCode(code: string) {
  // Use admin client to bypass RLS - countries are public data within the app
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("countries").select("*").eq("code", code.toUpperCase()).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function addCountry(code: string, name: string) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()

  const { data, error } = await supabase
    .from("countries")
    .upsert({ code: codeUpper, name, active: true }, { onConflict: "code" })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/countries")
  revalidatePath(`/c/${codeUpper}`)
  revalidatePath(`/c/${codeUpper}/scorecards`)

  return data
}

export async function updateCountry(code: string, updates: { name?: string; active?: boolean }) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("countries")
    .update(updates)
    .eq("code", code.toUpperCase())
    .select()
    .single()

  if (error) throw error

  revalidatePath("/countries")
  revalidatePath(`/c/${code}`)
  revalidatePath(`/c/${code}/scorecards`)

  return data
}

export async function deleteCountry(code: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("countries").delete().eq("code", code.toUpperCase())

  if (error) throw error
  revalidatePath("/countries")
}
