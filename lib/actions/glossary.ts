"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type GlossaryTermInsert = {
  term: string
  definition: string
  category?: string
}

export type GlossaryTermUpdate = Partial<GlossaryTermInsert> & { id: string }

export async function getGlossaryTerms() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("glossary_terms").select("*").order("category").order("term")

  if (error) throw error
  return data
}

export async function createGlossaryTerm(term: GlossaryTermInsert) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("glossary_terms").insert(term).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateGlossaryTerm(update: GlossaryTermUpdate) {
  const supabase = createAdminClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("glossary_terms").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteGlossaryTerm(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
