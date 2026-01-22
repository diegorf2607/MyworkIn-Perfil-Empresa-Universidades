// scripts/setup-admin.ts
import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const email = "admin@myworkkin.pe";
const password = "admin123";
const name = "Admin MyWorkIn";

async function createAdmin() {
  console.log("🚀 Creating admin user...");

  let userId: string;

  // Intentar crear usuario o obtenerlo si ya existe
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authError) {
    // Si el usuario ya existe, obtenerlo por email
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      console.log("ℹ️ User already exists, fetching user...");
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("❌ Error fetching users:", listError.message);
        process.exit(1);
      }
      const existingUser = usersData.users.find(u => u.email === email);
      if (!existingUser) {
        console.error("❌ User not found");
        process.exit(1);
      }
      userId = existingUser.id;
      console.log("✅ Found existing user");
    } else {
      console.error("❌ Error creating admin:", authError.message);
      process.exit(1);
    }
  } else {
    userId = authData.user.id;
    console.log("✅ User created in Authentication");
  }

  console.log("🆔 User ID:", userId);

  // Verificar si ya existe en team_members
  const { data: existingMember, error: checkError } = await supabase
    .from('team_members')
    .select('id, role')
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error("❌ Error checking team member:", checkError.message);
    process.exit(1);
  }

  if (existingMember) {
    console.log("ℹ️ Team member already exists with role:", existingMember.role);
    console.log("✅ Setup complete");
    return;
  }

  // Crear registro en team_members con role="admin"
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .insert({
      user_id: userId,
      name: name,
      email: email,
      role: 'admin',
      is_active: true,
    })
    .select()
    .single();

  if (memberError) {
    console.error("❌ Error creating team member:", memberError.message);
    process.exit(1);
  }

  console.log("✅ Admin created successfully");
  console.log("📧 Email:", email);
  console.log("🆔 User ID:", userId);
  console.log("👤 Team Member ID:", memberData.id);
  console.log("🔑 Role: admin");
}

createAdmin();
