"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

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
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getContacts:", error)
    return []
  }
  return data || []
}

export async function getContactsByAccount(accountId: string) {
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getContactsByAccount:", error)
    return []
  }
  return data || []
}

export async function createContact(contact: ContactInsert) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("contacts").insert(contact).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateContact(update: ContactUpdate) {
  const supabase = createAdminClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteContact(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("contacts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}
