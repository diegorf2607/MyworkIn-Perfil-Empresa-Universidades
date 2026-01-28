"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type SequenceInsert = {
  country_code: string
  channel: "email" | "linkedin" | "whatsapp"
  name: string
}

export type SequenceStepInsert = {
  sequence_id: string
  step_order: number
  content: string
  delay?: string
}

export async function getSequences(countryCode?: string) {
  const supabase = createAdminClient()
  let query = supabase.from("sequences").select("*, sequence_steps(*)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("channel").order("name")

  if (error) throw error
  return data
}

export async function createSequence(sequence: SequenceInsert) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("sequences").insert(sequence).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteSequence(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("sequences").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function addSequenceStep(step: SequenceStepInsert) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("sequence_steps").insert(step).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateSequenceStep(id: string, updates: Partial<SequenceStepInsert>) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("sequence_steps").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteSequenceStep(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("sequence_steps").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
