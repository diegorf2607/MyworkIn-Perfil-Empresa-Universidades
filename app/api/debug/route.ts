import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  }

  try {
    const supabase = createAdminClient()
    
    // Test: fetch countries
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .limit(5)

    if (error) {
      diagnostics.supabaseError = {
        message: error.message,
        code: error.code,
        details: error.details,
      }
    } else {
      diagnostics.countriesCount = data?.length || 0
      diagnostics.countries = data?.map(c => ({ code: c.code, name: c.name, active: c.active }))
      diagnostics.status = "✅ Connected successfully"
    }
  } catch (error: any) {
    diagnostics.error = error.message
    diagnostics.status = "❌ Failed to connect"
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
