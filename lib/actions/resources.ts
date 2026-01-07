"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ResourceCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export type ResourceInsert = {
  country_code?: string // Made optional since resources are now global
  category: string // Changed from union to string for dynamic categories
  title: string
  description?: string
  url: string
  owner_id?: string
}

export type ResourceUpdate = Partial<ResourceInsert> & { id: string }

export async function getResourceCategories(): Promise<ResourceCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("resource_categories").select("*").order("sort_order")

  if (error) throw error
  return data || []
}

export async function createResourceCategory(category: { name: string; description?: string; icon?: string }) {
  const supabase = await createClient()

  // Get max sort_order
  const { data: maxData } = await supabase
    .from("resource_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxData?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from("resource_categories")
    .insert({ ...category, sort_order: nextOrder })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteResourceCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("resource_categories").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function getResources(countryCode?: string) {
  const supabase = await createClient()
  let query = supabase.from("resources").select("*, team_members(name)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("category").order("title")

  if (error) throw error
  return data || []
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
