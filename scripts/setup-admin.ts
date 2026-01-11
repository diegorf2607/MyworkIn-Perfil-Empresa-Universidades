// scripts/setup-admin.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const email = "admin@myworkin.pe";
const password = "admin123";
const name = "Admin MyWorkIn";

async function createAdmin() {
  console.log("🚀 Creating admin user...");

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }

  console.log("✅ Admin created successfully");
  console.log("📧 Email:", email);
  console.log("🆔 User ID:", data.user.id);
}

createAdmin();
