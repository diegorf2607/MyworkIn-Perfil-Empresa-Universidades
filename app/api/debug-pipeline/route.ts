import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Obtener todas las cuentas con su stage y mrr
    const { data: accounts, error: accError } = await supabase
      .from("accounts")
      .select("id, name, stage, country_code, mrr")
    
    // Contar por stage
    const stageCount: Record<string, { count: number; totalMrr: number }> = {}
    accounts?.forEach(acc => {
      const stage = acc.stage || "null"
      if (!stageCount[stage]) {
        stageCount[stage] = { count: 0, totalMrr: 0 }
      }
      stageCount[stage].count++
      stageCount[stage].totalMrr += Number(acc.mrr || 0)
    })
    
    // Cuentas con MRR > 0
    const accountsWithMrr = accounts?.filter(a => Number(a.mrr) > 0) || []
    
    // Cuentas won
    const wonAccounts = accounts?.filter(a => a.stage === "won") || []
    
    return NextResponse.json({ 
      success: true,
      summary: {
        total: accounts?.length || 0,
        byStage: stageCount,
      },
      accountsWithMrr: accountsWithMrr.map(a => ({
        name: a.name,
        stage: a.stage,
        mrr: a.mrr,
        country: a.country_code
      })),
      wonAccounts: wonAccounts.map(a => ({
        name: a.name,
        mrr: a.mrr,
        country: a.country_code
      })),
      error: accError?.message
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}
