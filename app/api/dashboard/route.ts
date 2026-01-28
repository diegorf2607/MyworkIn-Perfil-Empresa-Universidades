import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get("country") || "ALL"
    
    const supabase = createAdminClient()
    const isGlobal = countryCode === "ALL"

    // Get active countries
    const { data: countries } = await supabase
      .from("countries")
      .select("code, name, active")
      .eq("active", true)

    const activeCodes = countries?.map((c) => c.code) || []

    if (isGlobal && activeCodes.length === 0) {
      return NextResponse.json({
        success: true,
        metrics: {
          totalAccounts: 0, leads: 0, sqls: 0, oppsActive: 0, won: 0, lost: 0,
          mrrPipeline: 0, mrrWon: 0, upcomingMeetings: 0, winRate: 0
        },
        countries: [],
        byCountry: {}
      })
    }

    // Build queries
    let accountsQuery = supabase.from("accounts").select("*")
    let oppsQuery = supabase.from("opportunities").select("*")
    let meetingsQuery = supabase.from("meetings").select("*")

    if (!isGlobal) {
      accountsQuery = accountsQuery.eq("country_code", countryCode.toUpperCase())
      oppsQuery = oppsQuery.eq("country_code", countryCode.toUpperCase())
      meetingsQuery = meetingsQuery.eq("country_code", countryCode.toUpperCase())
    } else if (activeCodes.length > 0) {
      accountsQuery = accountsQuery.in("country_code", activeCodes)
      oppsQuery = oppsQuery.in("country_code", activeCodes)
      meetingsQuery = meetingsQuery.in("country_code", activeCodes)
    }

    const [
      { data: accounts },
      { data: opportunities },
      { data: meetings }
    ] = await Promise.all([
      accountsQuery,
      oppsQuery,
      meetingsQuery,
    ])

    // Calculate metrics
    const totalAccounts = accounts?.length || 0
    const leads = accounts?.filter((a) => a.stage === "lead").length || 0
    const sqls = accounts?.filter((a) => a.stage === "sql").length || 0
    const oppsActive = accounts?.filter((a) => a.stage === "opp").length || 0
    const won = opportunities?.filter((o) => o.stage === "won").length || 0
    const lost = opportunities?.filter((o) => o.stage === "lost").length || 0

    const mrrPipeline = opportunities
      ?.filter((o) => !["won", "lost"].includes(o.stage || ""))
      .reduce((sum, o) => sum + Number(o.mrr || 0), 0) || 0

    const mrrWon = opportunities
      ?.filter((o) => o.stage === "won")
      .reduce((sum, o) => sum + Number(o.mrr || 0), 0) || 0

    // Meetings in next 7 days
    const now = new Date()
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcomingMeetings = meetings?.filter((m) => {
      const meetingDate = new Date(m.date_time)
      return meetingDate >= now && meetingDate <= next7Days && m.outcome === "pending"
    }).length || 0

    const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0

    // Calculate by country
    const byCountry: Record<string, { accounts: number; sqls: number; mrr: number; mrrWon: number; opps: number }> = {}
    
    for (const country of (countries || [])) {
      const countryAccounts = accounts?.filter(a => a.country_code === country.code) || []
      const countryOpps = opportunities?.filter(o => o.country_code === country.code) || []
      
      byCountry[country.code] = {
        accounts: countryAccounts.length,
        sqls: countryAccounts.filter(a => a.stage === "sql").length,
        opps: countryOpps.filter(o => !["won", "lost"].includes(o.stage || "")).length,
        mrr: countryOpps
          .filter(o => !["won", "lost"].includes(o.stage || ""))
          .reduce((sum, o) => sum + Number(o.mrr || 0), 0),
        mrrWon: countryOpps
          .filter(o => o.stage === "won")
          .reduce((sum, o) => sum + Number(o.mrr || 0), 0)
      }
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalAccounts,
        leads,
        sqls,
        oppsActive,
        won,
        lost,
        mrrPipeline,
        mrrWon,
        upcomingMeetings,
        winRate
      },
      countries: countries || [],
      byCountry
    })
  } catch (error: any) {
    console.error("[Dashboard API] Error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
