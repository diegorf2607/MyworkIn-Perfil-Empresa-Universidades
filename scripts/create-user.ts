import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
  console.error("   SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Default values for admin user
const email = "admin@myworkin.pe"
const password = "admin123"
const name = "Admin MyWorkIn"
const role = "admin"

async function createUser() {
  console.log(`🚀 Creating user: ${email} with role: ${role}...`)

  // 1. Check if user already exists
  const { data: existingUsers } = await supabase.from("team_members").select("id").eq("email", email)

  if (existingUsers && existingUsers.length > 0) {
    console.log("⚠️ User already exists in team_members")
    return
  }

  // 2. Create user in Authentication
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    console.error("❌ Error creating user:", authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log("✅ User created in Authentication")
  console.log("🆔 User ID:", userId)

  // 3. Create record in team_members
  const { data: memberData, error: memberError } = await supabase
    .from("team_members")
    .insert({
      user_id: userId,
      name: name,
      email: email,
      role: role,
      is_active: true,
    })
    .select()
    .single()

  if (memberError) {
    console.error("❌ Error creating team member:", memberError.message)
    // Delete auth user if insertion fails
    await supabase.auth.admin.deleteUser(userId)
    process.exit(1)
  }

  console.log("✅ User created successfully!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📧 Email:", email)
  console.log("🔐 Password:", password)
  console.log("🆔 User ID:", userId)
  console.log("👤 Team Member ID:", memberData.id)
  console.log("🔑 Role:", role)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("You can now log in with these credentials.")
}

createUser().catch(console.error)
