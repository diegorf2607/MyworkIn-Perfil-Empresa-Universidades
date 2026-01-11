"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Create user in auth.users using Admin API
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Insert into team_members
    const { error: teamError } = await admin.from("team_members").insert({
      user_id: authUser.user.id,
      name: name || email.split("@")[0],
      email,
      role: "admin",
      is_active: true,
    })

    if (teamError) {
      console.error("[v0] Team error:", teamError)
      return NextResponse.json({ error: teamError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
