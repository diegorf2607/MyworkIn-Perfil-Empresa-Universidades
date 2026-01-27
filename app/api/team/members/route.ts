import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient()
    
    // 1. Verify requester is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if there are any team members yet
    const { data: existingMembers } = await adminClient
      .from("team_members")
      .select("id")
      .limit(1)
    
    // If there are existing members, verify the requester is one of them
    if (existingMembers && existingMembers.length > 0) {
      const { data: requesterMember } = await adminClient
        .from("team_members")
        .select("role, is_active")
        .eq("user_id", user.id)
        .single()

      // Allow if user is an active team member
      if (!requesterMember || requesterMember.is_active === false) {
        return NextResponse.json({ error: "Forbidden: Active team member access required" }, { status: 403 })
      }
    }
    // If no team members exist, allow the first authenticated user to create one

    // 2. Parse and validate request body
    const body = await request.json()
    const { name, email, password, role, country_codes, is_active } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (!role || !["SDR", "AE"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be SDR or AE" }, { status: 400 })
    }

    if (!country_codes || country_codes.length === 0) {
      return NextResponse.json({ error: "At least one country assignment is required" }, { status: 400 })
    }

    // 3. Create auth user using Admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
      },
    })

    if (authError) {
      console.error("[v0] Error creating auth user:", authError)
      return NextResponse.json({ error: `Failed to create user: ${authError.message}` }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    }

    // 4. Insert into team_members (using admin client to bypass RLS)
    const { error: memberError } = await adminClient.from("team_members").insert({
      user_id: authData.user.id,
      name,
      email,
      role,
      is_active: is_active ?? true,
    })

    if (memberError) {
      console.error("[v0] Error creating team member:", memberError)
      // Rollback: delete auth user
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `Failed to create team member: ${memberError.message}` }, { status: 500 })
    }

    // 5. Insert country assignments (using admin client to bypass RLS)
    if (country_codes && country_codes.length > 0) {
      const countryInserts = country_codes.map((code: string) => ({
        member_user_id: authData.user.id,
        country_code: code,
      }))

      const { error: countriesError } = await adminClient.from("team_member_countries").insert(countryInserts)

      if (countriesError) {
        console.error("[v0] Error assigning countries:", countriesError)
        // Rollback: delete team member and auth user
        await adminClient.from("team_members").delete().eq("user_id", authData.user.id)
        await adminClient.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json({ error: `Failed to assign countries: ${countriesError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/team/members:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
