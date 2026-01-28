import { createClient } from "@supabase/supabase-js"

// This client bypasses RLS and can perform admin operations
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // During build time or if env vars are missing, return a mock client that will fail gracefully
    console.warn("⚠️ Supabase admin client: Missing environment variables")
    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseServiceRoleKey || "placeholder-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
