"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type GlossaryTermInsert = {
  term: string
  definition: string
  category?: string
}

export type GlossaryTermUpdate = Partial<GlossaryTermInsert> & { id: string }

export async function getGlossaryTerms() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("glossary_terms").select("*").order("category").order("term")

  if (error) throw error
  return data
}

export async function createGlossaryTerm(term: GlossaryTermInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("glossary_terms").insert(term).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateGlossaryTerm(update: GlossaryTermUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("glossary_terms").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteGlossaryTerm(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("glossary_terms").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
