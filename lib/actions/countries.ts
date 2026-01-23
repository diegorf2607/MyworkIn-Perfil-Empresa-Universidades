"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getCountries() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("countries").select("*").order("name")

  if (error) throw error
  return data
}

export async function getActiveCountries() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("countries").select("*").eq("active", true).order("name")

  if (error) throw error
  return data
}

export async function getCountryByCode(code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("countries").select("*").eq("code", code.toUpperCase()).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function addCountry(code: string, name: string) {
  const supabase = createAdminClient()
  const codeUpper = code.toUpperCase()

  const { data, error } = await supabase
    .from("countries")
    .insert({ code: codeUpper, name, active: true })
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
