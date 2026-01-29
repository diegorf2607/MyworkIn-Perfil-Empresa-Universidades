import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // 1. Obtener opportunities (sin owner_id que no existe)
    const { data: opportunities, error: oppsError } = await supabase
      .from("opportunities")
      .select("id, stage, mrr, country_code, account_id")
    
    // 2. Obtener accounts
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, name, stage, country_code, mrr")
    
    // Contar opportunities por stage
    const oppsStageCount: Record<string, { count: number; totalMrr: number }> = {}
    opportunities?.forEach(opp => {
      const stage = opp.stage || "null"
      if (!oppsStageCount[stage]) {
        oppsStageCount[stage] = { count: 0, totalMrr: 0 }
      }
      oppsStageCount[stage].count++
      oppsStageCount[stage].totalMrr += Number(opp.mrr || 0)
    })
    
    // Contar accounts por stage
    const accStageCount: Record<string, { count: number; totalMrr: number }> = {}
    accounts?.forEach(acc => {
      const stage = acc.stage || "null"
      if (!accStageCount[stage]) {
        accStageCount[stage] = { count: 0, totalMrr: 0 }
      }
      accStageCount[stage].count++
      accStageCount[stage].totalMrr += Number(acc.mrr || 0)
    })
    
    // Opportunities con MRR > 0
    const oppsWithMrr = opportunities?.filter(o => Number(o.mrr) > 0) || []
    
    // Opportunities won
    const wonOpps = opportunities?.filter(o => o.stage === "won") || []
    
    return NextResponse.json({ 
      success: true,
      opportunities: {
        total: opportunities?.length || 0,
        byStage: oppsStageCount,
        withMrr: oppsWithMrr,
        won: wonOpps,
        error: oppsError?.message
      },
      accounts: {
        total: accounts?.length || 0,
        byStage: accStageCount,
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
