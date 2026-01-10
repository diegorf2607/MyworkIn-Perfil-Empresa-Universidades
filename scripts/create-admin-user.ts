import { createAdminClient } from "../lib/supabase/admin"

async function createAdminUser() {
  console.log("Creating admin user...")

  const admin = createAdminClient()

  // Create user in auth.users using Admin API
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: "admin@myworkin.pe",
    password: "admin123",
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      name: "Admin MyWorkIn",
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return
  }

  console.log("Auth user created:", authData.user.id)

  // Insert into team_members table
  const { data: memberData, error: memberError } = await admin
    .from("team_members")
    .insert({
      user_id: authData.user.id,
      name: "Admin MyWorkIn",
      email: "admin@myworkin.pe",
      role: "admin",
      is_active: true,
    })
    .select()
    .single()

  if (memberError) {
    console.error("Error creating team member:", memberError)
    return
  }

  console.log("✅ Admin user created successfully!")
  console.log("Email: admin@myworkin.pe")
  console.log("Password: admin123")
  console.log("User ID:", authData.user.id)
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
