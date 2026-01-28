import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // 1. Obtener oportunidades directamente
    const { data: opportunities, error: oppsError } = await supabase
      .from("opportunities")
      .select("id, stage, mrr, country_code, account_id, owner_id")
    
    // 2. Obtener cuentas
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, name, stage, country_code, mrr")
    
    // 3. Ver qué stages hay
    const stageCount: Record<string, number> = {}
    opportunities?.forEach(opp => {
      const stage = opp.stage || "null"
      stageCount[stage] = (stageCount[stage] || 0) + 1
    })
    
    return NextResponse.json({ 
      success: true,
      opportunities: {
        total: opportunities?.length || 0,
        byStage: stageCount,
        sample: opportunities?.slice(0, 5),
        error: oppsError?.message
      },
      accounts: {
        total: accounts?.length || 0,
        sample: accounts?.slice(0, 5),
        error: accError?.message
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}
