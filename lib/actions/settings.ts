"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type AppSettings = {
  mrr_target?: number
  universities_target?: number
  sqls_target?: number
  meetings_target?: number
  initialized?: boolean
  north_star_text?: string
  hero_text?: string
}

export async function getAppSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", "main").single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateAppSettings(settings: Partial<AppSettings>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ id: "main", ...settings, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/c")
  return data
}

export async function initializeApp(settings: Omit<AppSettings, "initialized">) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({
      id: "main",
      ...settings,
      initialized: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath("/")
  return data
}
