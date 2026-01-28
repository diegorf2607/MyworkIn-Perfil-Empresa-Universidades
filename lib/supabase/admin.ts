import { createClient } from "@supabase/supabase-js"

let adminClientInstance: ReturnType<typeof createClient> | null = null

// This client bypasses RLS and can perform admin operations
export function createAdminClient() {
  if (adminClientInstance) return adminClientInstance
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  adminClientInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  
  return adminClientInstance
}
