"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type QuickLinkInsert = {
  title: string
  url: string
  category?: string
}

export type QuickLinkUpdate = Partial<QuickLinkInsert> & { id: string }

export async function getQuickLinks() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("quick_links").select("*").order("category").order("title")

  if (error) throw error
  return data
}

export async function createQuickLink(link: QuickLinkInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("quick_links").insert(link).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateQuickLink(update: QuickLinkUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("quick_links").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteQuickLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("quick_links").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
