"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenciales inválidas" }
  }

  revalidatePath("/", "layout")
  return { error: null }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const redirectTo = `${siteUrl}/auth/reset`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: "Error al enviar el correo. Verifica tu email." }
  }

  return { error: null }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: "Error al actualizar la contraseña. Intenta nuevamente." }
  }

  // Sign out after password update
  await supabase.auth.signOut()

  return { error: null }
}
