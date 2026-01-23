"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type TaskInsert = {
  country_code: string
  title: string
  account_id?: string
  due_date: string
  status?: "pending" | "completed"
}

export type TaskUpdate = Partial<TaskInsert> & { id: string }

export async function getTasks(countryCode?: string) {
  const supabase = await createClient()
  let query = supabase.from("tasks").select("*, accounts(name)")

  if (countryCode) {
    query = query.eq("country_code", countryCode)
  }

  const { data, error } = await query.order("due_date").order("status")

  if (error) throw error
  return data
}

export async function createTask(task: TaskInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function updateTask(update: TaskUpdate) {
  const supabase = await createClient()
  const { id, ...updates } = update
  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) throw error
  revalidatePath("/")
}

export async function toggleTaskStatus(id: string) {
  const supabase = await createClient()

  // Get current status
  const { data: task } = await supabase.from("tasks").select("status").eq("id", id).single()

  const newStatus = task?.status === "pending" ? "completed" : "pending"

  const { data, error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", id).select().single()

  if (error) throw error
  revalidatePath("/")
  return data
}
