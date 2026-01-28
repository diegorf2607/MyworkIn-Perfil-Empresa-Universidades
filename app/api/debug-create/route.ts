import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[debug-create] Received:", JSON.stringify(body))
    
    const supabase = createAdminClient()
    
    // Test insert
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        country_code: body.country_code?.toUpperCase() || "PE",
        name: body.name || "Test University",
        city: body.city || null,
        type: body.type || "privada",
        size: body.size || "mediana",
        stage: body.stage || "lead",
        source: body.source || "outbound",
        fit_comercial: body.fit_comercial || "medio",
        status: "activo",
        mrr: 0,
        probability: 10,
        last_touch: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[debug-create] Error:", error)
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    console.log("[debug-create] Success:", data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("[debug-create] Exception:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Check env vars first
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing environment variables",
        env: {
          hasSupabaseUrl: !!supabaseUrl,
          supabaseUrlPrefix: supabaseUrl?.substring(0, 30) + "...",
          hasServiceKey: !!serviceKey,
          serviceKeyPrefix: serviceKey ? serviceKey.substring(0, 10) + "..." : null,
        }
      }, { status: 500 })
    }
    
    const supabase = createAdminClient()
    
    // Test connection
    const { data, error } = await supabase.from("accounts").select("id, name").limit(3)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        errorDetails: error,
        env: {
          hasSupabaseUrl: true,
          hasServiceKey: true,
        }
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Connection OK",
      sample: data,
      env: {
        hasSupabaseUrl: true,
        hasServiceKey: true,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 })
  }
}
