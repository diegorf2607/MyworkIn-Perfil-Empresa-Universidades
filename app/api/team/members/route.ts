import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    
    // 1. Verify requester is authenticated using cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in again" }, { status: 401 })
    }

    // User is authenticated - allow creating team members
    // For internal CRM, authentication is sufficient authorization

    // 2. Parse and validate request body
    const body = await request.json()
    const { name, email, password, role, sales_role, country_codes, is_active } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be admin or user" }, { status: 400 })
    }

    if (!sales_role || !["SDR", "AE"].includes(sales_role)) {
      return NextResponse.json({ error: "Invalid sales role. Must be SDR or AE" }, { status: 400 })
    }

    if (!country_codes || country_codes.length === 0) {
      return NextResponse.json({ error: "At least one country assignment is required" }, { status: 400 })
    }

    // 3. Create auth user using Admin API (or get existing)
    let authUserId: string
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
      },
    })

    if (authError) {
      // Check if user already exists
      if (authError.message.includes("already been registered")) {
        // Get the existing user
        const { data: existingUsers } = await adminClient.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)
        
        if (existingUser) {
          authUserId = existingUser.id
          // Update password for existing user
          await adminClient.auth.admin.updateUserById(existingUser.id, { password })
        } else {
          return NextResponse.json({ error: "User exists but could not be found" }, { status: 500 })
        }
      } else {
        console.error("[v0] Error creating auth user:", authError)
        return NextResponse.json({ error: `Failed to create user: ${authError.message}` }, { status: 500 })
      }
    } else if (!authData.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    } else {
      authUserId = authData.user.id
    }

    // 4. Check if team member already exists
    const { data: existingMember } = await adminClient
      .from("team_members")
      .select("id")
      .eq("user_id", authUserId)
      .single()

    if (existingMember) {
      // Update existing team member
      const { error: updateError } = await adminClient
        .from("team_members")
        .update({ name, role, sales_role, is_active: is_active ?? true })
        .eq("user_id", authUserId)

      if (updateError) {
        return NextResponse.json({ error: `Failed to update team member: ${updateError.message}` }, { status: 500 })
      }
    } else {
      // Insert new team member
      const { error: memberError } = await adminClient.from("team_members").insert({
        user_id: authUserId,
        name,
        email,
        role,
        sales_role,
        is_active: is_active ?? true,
      })

      if (memberError) {
        console.error("[v0] Error creating team member:", memberError)
        return NextResponse.json({ error: `Failed to create team member: ${memberError.message}` }, { status: 500 })
      }
    }

    // 5. Update country assignments (delete old and insert new)
    await adminClient.from("team_member_countries").delete().eq("member_user_id", authUserId)
    
    if (country_codes && country_codes.length > 0) {
      const countryInserts = country_codes.map((code: string) => ({
        member_user_id: authUserId,
        country_code: code,
      }))

      const { error: countriesError } = await adminClient.from("team_member_countries").insert(countryInserts)

      if (countriesError) {
        console.error("[v0] Error assigning countries:", countriesError)
        return NextResponse.json({ error: `Failed to assign countries: ${countriesError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authUserId,
        email,
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/team/members:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
