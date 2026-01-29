"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { createActivity } from "./activities"
import { type WorkspaceId, DEFAULT_WORKSPACE } from "@/lib/config/workspaces"

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
  workspace_id?: WorkspaceId
}

export type AccountUpdate = Partial<AccountInsert> & { id: string }

export async function getAccounts(countryCode?: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  // Disable caching - always fetch fresh data
  noStore()
  
  // Use admin client to bypass RLS for read operations
  const supabase = createAdminClient()
  
  // Simple query without joins to avoid potential relationship issues
  // For mkn: only include data explicitly marked with workspace_id = 'mkn'
  // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
  let query = supabase.from("accounts").select("*")
  
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  if (countryCode) {
    // Normalize to uppercase for consistent matching
    query = query.eq("country_code", countryCode.toUpperCase())
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getAccounts:", error)
    throw error
  }
  return data || []
}

export async function getAccountsByStage(countryCode: string, stage: string, workspaceId: WorkspaceId = DEFAULT_WORKSPACE) {
  noStore()
  const supabase = createAdminClient()
  
  // Simple query without joins to avoid potential relationship issues
  // For mkn: only include data explicitly marked with workspace_id = 'mkn'
  // For myworkin: include ALL data (legacy data doesn't have workspace_id column)
  let query = supabase
    .from("accounts")
    .select("*")
    .eq("country_code", countryCode.toUpperCase())
    .eq("stage", stage)
  
  if (workspaceId === "mkn") {
    query = query.eq("workspace_id", "mkn")
  }
  // No filter for myworkin - includes all existing/legacy data

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error in getAccountsByStage:", error)
    throw error
  }
  return data || []
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
  console.log("[createAccount] Starting with:", JSON.stringify(account))
  
  const supabase = createAdminClient()

  const exists = await checkAccountNameExists(account.country_code.toUpperCase(), account.name)
  if (exists) {
    console.log("[createAccount] Duplicate name found")
    throw new Error("DUPLICATE_NAME")
  }

  const insertData = { 
    ...account, 
    country_code: account.country_code.toUpperCase(),
    workspace_id: account.workspace_id || DEFAULT_WORKSPACE, // Ensure workspace_id
    last_touch: new Date().toISOString() 
  }
  console.log("[createAccount] Inserting:", JSON.stringify(insertData))

  const { data, error } = await supabase
    .from("accounts")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[createAccount] Insert error:", error)
    throw error
  }
  
  console.log("[createAccount] Created account:", data.id)

  try {
    await createActivity({
      account_id: data.id,
      country_code: account.country_code.toUpperCase(),
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
  noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*, contacts(*), opportunities(*)")
    .eq("country_code", countryCode.toUpperCase())
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })

  if (error) throw error
  return data
}
