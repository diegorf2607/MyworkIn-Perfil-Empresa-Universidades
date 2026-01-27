"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { createActivity } from "./activities"

export type AccountInsert = {
  country_code: string
  name: string
  city?: string
  type?: "privada" | "pública"
  website?: string
  size?: "pequeña" | "mediana" | "grande"
  owner_id?: string
  icp_fit?: number
  stage?: "lead" | "sql" | "opp" | "won" | "lost"
  source?: "inbound" | "outbound" | "referral" | "evento"
  next_action?: string
  next_action_date?: string
  probability?: number
  mrr?: number
  status?: "activo" | "pausado" | "archivado"
  notes?: string
  fit_comercial?: "alto" | "medio" | "bajo"
  first_contact_at?: string
  last_contact_at?: string
  next_follow_up_at?: string
  next_follow_up_label?: string
}

export type AccountUpdate = Partial<AccountInsert> & { id: string }

export async function getAccounts(countryCode?: string) {
  // Disable caching - always fetch fresh data
  noStore()
  
  // Use admin client to bypass RLS for read operations
  const supabase = createAdminClient()
  let query = supabase.from("accounts").select("*, contacts(*), opportunities(*)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getAccountsByStage(countryCode: string, stage: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*, contacts(*), opportunities(*)")
    .eq("country_code", countryCode)
    .eq("stage", stage)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getAccountById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*, contacts(*), opportunities(*), activities(*), meetings(*)")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function checkAccountNameExists(countryCode: string, name: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("id")
    .eq("country_code", countryCode)
    .ilike("name", name.trim())
    .limit(1)

  if (error) throw error
  return data && data.length > 0
}

export async function createAccount(account: AccountInsert) {
  const supabase = createAdminClient()

  const exists = await checkAccountNameExists(account.country_code, account.name)
  if (exists) {
    throw new Error("DUPLICATE_NAME")
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({ ...account, last_touch: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error

  try {
    await createActivity({
      account_id: data.id,
      country_code: account.country_code,
      type: "account_created",
      owner_id: account.owner_id,
      summary: `Universidad "${account.name}" creada como ${account.stage?.toUpperCase() || "Lead"}`,
      date_time: new Date().toISOString(),
      details: {
        stage: account.stage,
        city: account.city,
        source: account.source,
      },
    })
  } catch (e) {
    console.error("Error creating activity for account:", e)
  }

  revalidatePath(`/c/${account.country_code}`)
  return data
}

export async function updateAccount(update: AccountUpdate) {
  const supabase = createAdminClient()
  const { id, ...updates } = update
  const { data, error } = await supabase
    .from("accounts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

// Upsert: create if not exists, update if exists (for CSV import)
export async function upsertAccount(account: AccountInsert): Promise<{ created: boolean; data: any }> {
  const supabase = createAdminClient()

  // Check if exists
  const { data: existing } = await supabase
    .from("accounts")
    .select("id")
    .eq("country_code", account.country_code)
    .ilike("name", account.name.trim())
    .limit(1)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("accounts")
      .update({
        city: account.city,
        type: account.type,
        size: account.size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) throw error
    return { created: false, data }
  } else {
    // Create new
    const { data, error } = await supabase
      .from("accounts")
      .insert({ ...account, last_touch: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error

    try {
      await createActivity({
        account_id: data.id,
        country_code: account.country_code,
        type: "account_created",
        owner_id: account.owner_id,
        summary: `Universidad "${account.name}" importada como ${account.stage?.toUpperCase() || "Lead"}`,
        date_time: new Date().toISOString(),
        details: {
          stage: account.stage,
          city: account.city,
          source: "csv_import",
        },
      })
    } catch (e) {
      console.error("Error creating activity for account:", e)
    }

    return { created: true, data }
  }
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  // Delete related contacts
  await supabase.from("contacts").delete().eq("account_id", id)

  // Delete related opportunities
  await supabase.from("opportunities").delete().eq("account_id", id)

  // Delete related activities
  await supabase.from("activities").delete().eq("account_id", id)

  // Delete related meetings
  await supabase.from("meetings").delete().eq("account_id", id)

  // Finally delete the account
  const { error } = await supabase.from("accounts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function updateAccountStage(id: string, stage: string) {
  const supabase = await createClient()

  const { data: account } = await supabase
    .from("accounts")
    .select("name, country_code, owner_id, stage")
    .eq("id", id)
    .single()

  const { data, error } = await supabase
    .from("accounts")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  if (account && account.stage !== stage) {
    try {
      await createActivity({
        account_id: id,
        country_code: account.country_code,
        type: "stage_changed",
        owner_id: account.owner_id,
        summary: `"${account.name}" cambió de ${account.stage?.toUpperCase() || "N/A"} a ${stage.toUpperCase()}`,
        date_time: new Date().toISOString(),
        details: {
          from_stage: account.stage,
          to_stage: stage,
        },
      })
    } catch (e) {
      console.error("Error creating activity for stage change:", e)
    }
  }

  revalidatePath("/")
  return data
}

export async function updateFollowUp(
  accountId: string,
  nextFollowUpAt: string | null,
  nextFollowUpLabel: string | null,
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .update({
      next_follow_up_at: nextFollowUpAt,
      next_follow_up_label: nextFollowUpLabel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function getAccountsWithFollowUp(countryCode: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*, contacts(*), opportunities(*)")
    .eq("country_code", countryCode)
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })

  if (error) throw error
  return data
}
