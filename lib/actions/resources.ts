"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ResourceInsert = {
  country_code: string
  category: "decks" | "casos" | "objeciones" | "pricing" | "looms" | "legal" | "implementacion"
  title: string
  description?: string
  url: string
  owner_id?: string
}

export type ResourceUpdate = Partial<ResourceInsert> & { id: string }

export async function getResources(countryCode?: string) {
  const supabase = await createClient()
  let query = supabase.from("resources").select("*, team_members(name)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("category").order("title")

  if (error) throw error
  return data
}

export async function createResource(resource: ResourceInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("resources")
    .insert({ ...resource, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateResource(update: ResourceUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase
    .from("resources")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteResource(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("resources").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
