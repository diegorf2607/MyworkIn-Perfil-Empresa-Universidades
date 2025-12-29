"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createActivity } from "./activities"

export interface KDMContact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  role_title: string | null
  linkedin_url: string | null
  referred_by: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  accounts?: { id: string; name: string; country_code: string; is_primary: boolean }[]
}

export interface KDMContactInsert {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role_title?: string | null
  linkedin_url?: string | null
  referred_by?: string | null
  notes?: string | null
}

export interface KDMContactUpdate extends Partial<KDMContactInsert> {
  id: string
  is_active?: boolean
}

export async function getKDMContacts(countryCode?: string) {
  const supabase = await createClient()

  // Get all KDM contacts
  const { data: contacts, error: contactsError } = await supabase.from("kdm_contacts").select("*").order("last_name")

  if (contactsError) {
    console.warn("kdm_contacts table may not exist:", contactsError)
    return []
  }

  // Get account links
  const { data: links, error: linksError } = await supabase
    .from("account_kdm_contacts")
    .select("kdm_contact_id, account_id, country_code, is_primary")

  if (linksError) {
    console.warn("account_kdm_contacts table may not exist:", linksError)
    return contacts?.map((c) => ({ ...c, accounts: [] })) || []
  }

  // Get accounts for names
  const { data: accounts } = await supabase.from("accounts").select("id, name, country_code")

  // Combine data
  const contactsWithAccounts = contacts?.map((contact) => {
    const contactLinks = links?.filter((l) => l.kdm_contact_id === contact.id) || []
    const linkedAccounts = contactLinks.map((link) => {
      const account = accounts?.find((a) => a.id === link.account_id)
      return {
        id: link.account_id,
        name: account?.name || "Unknown",
        country_code: link.country_code,
        is_primary: link.is_primary,
      }
    })
    return { ...contact, accounts: linkedAccounts }
  })

  // Filter by country if specified
  if (countryCode && countryCode !== "ALL") {
    return contactsWithAccounts?.filter((c) => c.accounts?.some((a) => a.country_code === countryCode)) || []
  }

  return contactsWithAccounts || []
}

export async function getKDMContactsByAccount(accountId: string) {
  const supabase = await createClient()

  // Get links for this account
  const { data: links, error: linksError } = await supabase
    .from("account_kdm_contacts")
    .select("kdm_contact_id, is_primary")
    .eq("account_id", accountId)

  if (linksError || !links?.length) {
    return []
  }

  const kdmIds = links.map((l) => l.kdm_contact_id)

  // Get KDM contacts
  const { data: contacts, error: contactsError } = await supabase
    .from("kdm_contacts")
    .select("*")
    .in("id", kdmIds)
    .order("last_name")

  if (contactsError) {
    return []
  }

  // Add is_primary flag
  return (
    contacts?.map((c) => ({
      ...c,
      is_primary: links.find((l) => l.kdm_contact_id === c.id)?.is_primary || false,
    })) || []
  )
}

export async function createKDMContact(contact: KDMContactInsert, accountId?: string, countryCode?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("kdm_contacts")
    .insert({
      ...contact,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  // If account is specified, create link
  if (accountId && countryCode && data) {
    await supabase.from("account_kdm_contacts").insert({
      kdm_contact_id: data.id,
      account_id: accountId,
      country_code: countryCode,
      is_primary: false,
    })

    try {
      await createActivity({
        account_id: accountId,
        country_code: countryCode,
        type: "kdm_created",
        summary: `KDM "${contact.first_name} ${contact.last_name}" agregado${contact.role_title ? ` (${contact.role_title})` : ""}`,
        date_time: new Date().toISOString(),
        details: {
          kdm_name: `${contact.first_name} ${contact.last_name}`,
          role_title: contact.role_title,
          email: contact.email,
        },
      })
    } catch (e) {
      console.error("Error creating activity for KDM:", e)
    }
  }

  revalidatePath("/")
  return data
}

export async function updateKDMContact(update: KDMContactUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update

  const { data, error } = await supabase
    .from("kdm_contacts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteKDMContact(id: string) {
  const supabase = await createClient()

  // Links will be deleted via CASCADE
  const { error } = await supabase.from("kdm_contacts").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function linkKDMToAccount(
  kdmContactId: string,
  accountId: string,
  countryCode: string,
  isPrimary = false,
) {
  const supabase = await createClient()

  // If setting as primary, unset other primaries for this account
  if (isPrimary) {
    await supabase.from("account_kdm_contacts").update({ is_primary: false }).eq("account_id", accountId)
  }

  const { data: kdm } = await supabase
    .from("kdm_contacts")
    .select("first_name, last_name, role_title")
    .eq("id", kdmContactId)
    .single()

  const { error } = await supabase.from("account_kdm_contacts").upsert(
    {
      kdm_contact_id: kdmContactId,
      account_id: accountId,
      country_code: countryCode,
      is_primary: isPrimary,
    },
    { onConflict: "account_id,kdm_contact_id" },
  )

  if (error) throw error

  if (kdm) {
    try {
      await createActivity({
        account_id: accountId,
        country_code: countryCode,
        type: "kdm_linked",
        summary: `KDM "${kdm.first_name} ${kdm.last_name}" vinculado${isPrimary ? " como principal" : ""}`,
        date_time: new Date().toISOString(),
        details: {
          kdm_name: `${kdm.first_name} ${kdm.last_name}`,
          role_title: kdm.role_title,
          is_primary: isPrimary,
        },
      })
    } catch (e) {
      console.error("Error creating activity for KDM link:", e)
    }
  }

  revalidatePath("/")
}

export async function unlinkKDMFromAccount(kdmContactId: string, accountId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("account_kdm_contacts")
    .delete()
    .eq("kdm_contact_id", kdmContactId)
    .eq("account_id", accountId)

  if (error) throw error
  revalidatePath("/")
}

export async function importKDMFromCSV(
  rows: {
    first_name: string
    last_name: string
    university?: string
    country_code: string
    role_title?: string
    email?: string
    phone?: string
    linkedin_url?: string
    referred_by?: string
    notes?: string
  }[],
) {
  const supabase = await createClient()

  const results = {
    created: 0,
    updated: 0,
    errors: [] as { row: number; reason: string }[],
  }

  // Get all accounts for university name resolution
  const { data: accounts } = await supabase.from("accounts").select("id, name, country_code")

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    try {
      // Validate required fields
      if (!row.first_name || !row.last_name) {
        results.errors.push({ row: i + 1, reason: "Nombre y apellido son requeridos" })
        continue
      }

      if (!row.country_code) {
        results.errors.push({ row: i + 1, reason: "País es requerido" })
        continue
      }

      // Check for existing contact by email (if provided) or name
      let existingContact = null

      if (row.email) {
        const { data } = await supabase.from("kdm_contacts").select("*").ilike("email", row.email).single()

        existingContact = data
      }

      if (!existingContact) {
        // Try to find by name
        const { data } = await supabase
          .from("kdm_contacts")
          .select("*")
          .ilike("first_name", row.first_name)
          .ilike("last_name", row.last_name)
          .single()

        existingContact = data
      }

      let kdmContactId: string

      if (existingContact) {
        // Update existing
        const { data, error } = await supabase
          .from("kdm_contacts")
          .update({
            role_title: row.role_title || existingContact.role_title,
            email: row.email || existingContact.email,
            phone: row.phone || existingContact.phone,
            linkedin_url: row.linkedin_url || existingContact.linkedin_url,
            referred_by: row.referred_by || existingContact.referred_by,
            notes: row.notes || existingContact.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingContact.id)
          .select()
          .single()

        if (error) throw error
        kdmContactId = data.id
        results.updated++
      } else {
        // Create new
        const { data, error } = await supabase
          .from("kdm_contacts")
          .insert({
            first_name: row.first_name,
            last_name: row.last_name,
            role_title: row.role_title || null,
            email: row.email || null,
            phone: row.phone || null,
            linkedin_url: row.linkedin_url || null,
            referred_by: row.referred_by || null,
            notes: row.notes || null,
            is_active: true,
          })
          .select()
          .single()

        if (error) throw error
        kdmContactId = data.id
        results.created++
      }

      // Link to university if provided
      if (row.university) {
        const account = accounts?.find(
          (a) => a.name.toLowerCase() === row.university!.toLowerCase() && a.country_code === row.country_code,
        )

        if (account) {
          await supabase.from("account_kdm_contacts").upsert(
            {
              kdm_contact_id: kdmContactId,
              account_id: account.id,
              country_code: row.country_code,
              is_primary: false,
            },
            { onConflict: "account_id,kdm_contact_id" },
          )
        } else {
          results.errors.push({ row: i + 1, reason: `Universidad "${row.university}" no encontrada` })
        }
      }
    } catch (error) {
      results.errors.push({ row: i + 1, reason: `Error: ${error}` })
    }
  }

  revalidatePath("/")
  return results
}
