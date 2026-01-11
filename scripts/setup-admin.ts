// scripts/setup-admin.ts
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const email = "admin@myworkin.pe"
const password = "admin123"
const name = "Admin MyWorkIn"

async function createAdmin() {
  console.log("🚀 Creating admin user...")

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    console.error("❌ Error creating admin in auth:", authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log("✅ User created in Authentication")
  console.log("🆔 User ID:", userId)

  const { data: memberData, error: memberError } = await supabase
    .from("team_members")
    .insert({
      user_id: userId,
      name: name,
      email: email,
      role: "admin",
      is_active: true,
    })
    .select()
    .single()

  if (memberError) {
    console.error("❌ Error creating team member:", memberError.message)
    // Try to delete the auth user if team_members insert fails
    await supabase.auth.admin.deleteUser(userId)
    process.exit(1)
  }

  console.log("✅ Admin created successfully!")
  console.log("📧 Email:", email)
  console.log("🔐 Password:", password)
  console.log("🆔 Auth User ID:", userId)
  console.log("👤 Team Member ID:", memberData.id)
  console.log("🔑 Role: admin")
  console.log("✅ Status: active")
}

createAdmin()
