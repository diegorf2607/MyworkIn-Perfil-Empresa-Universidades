"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ContactInsert = {
  account_id: string
  name: string
  role?: "KDM" | "influencer" | "procurement"
  title?: string
  email?: string
  whatsapp?: string
}

export type ContactUpdate = Partial<ContactInsert> & { id: string }

export async function getContacts() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getContactsByAccount(accountId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createContact(contact: ContactInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("contacts").insert(contact).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateContact(update: ContactUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
