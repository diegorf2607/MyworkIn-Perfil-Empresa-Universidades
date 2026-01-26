import { createClient } from "@supabase/supabase-js"

// This client bypasses RLS and can perform admin operations
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not configured")
    throw new Error("Missing SUPABASE_URL environment variable")
  }

  if (!supabaseServiceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured - check your environment variables in production")
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Make sure it's configured in your hosting platform (Vercel/Netlify).")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
