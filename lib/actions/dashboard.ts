"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getDashboardMetrics(countryCode?: string | "ALL") {
  const supabase = createAdminClient()

  const isGlobal = !countryCode || countryCode === "ALL"

  // Get active countries
  const { data: countries } = await supabase.from("countries").select("code").eq("active", true)

  const activeCodes = countries?.map((c) => c.code) || []

  // Build queries with optional country filter
  let accountsQuery = supabase.from("accounts").select("*")
  let oppsQuery = supabase.from("opportunities").select("*")
  let meetingsQuery = supabase.from("meetings").select("*")
  let scorecardsQuery = supabase.from("scorecards").select("*")

  if (!isGlobal) {
    accountsQuery = accountsQuery.eq("country_code", countryCode)
    oppsQuery = oppsQuery.eq("country_code", countryCode)
    meetingsQuery = meetingsQuery.eq("country_code", countryCode)
    scorecardsQuery = scorecardsQuery.eq("country_code", countryCode)
  } else {
    // Filter by active countries only
    accountsQuery = accountsQuery.in("country_code", activeCodes)
    oppsQuery = oppsQuery.in("country_code", activeCodes)
    meetingsQuery = meetingsQuery.in("country_code", activeCodes)
    scorecardsQuery = scorecardsQuery.in("country_code", activeCodes)
  }

  const [{ data: accounts }, { data: opportunities }, { data: meetings }, { data: scorecards }] = await Promise.all([
    accountsQuery,
    oppsQuery,
    meetingsQuery,
    scorecardsQuery,
  ])

  // Calculate metrics
  const totalAccounts = accounts?.length || 0
  const leads = accounts?.filter((a) => a.stage === "lead").length || 0
  const sqls = accounts?.filter((a) => a.stage === "sql").length || 0
  const oppsActive = accounts?.filter((a) => a.stage === "opp").length || 0
  const won = opportunities?.filter((o) => o.stage === "won").length || 0
  const lost = opportunities?.filter((o) => o.stage === "lost").length || 0

  const mrrPipeline =
    opportunities
      ?.filter((o) => !["won", "lost"].includes(o.stage || ""))
      .reduce((sum, o) => sum + Number(o.mrr || 0), 0) || 0

  const mrrWon = opportunities?.filter((o) => o.stage === "won").reduce((sum, o) => sum + Number(o.mrr || 0), 0) || 0

  // Meetings in next 7 days
  const now = new Date()
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingMeetings =
    meetings?.filter((m) => {
      const meetingDate = new Date(m.date_time)
      return meetingDate >= now && meetingDate <= next7Days && m.outcome === "pending"
    }).length || 0

  // Meetings this week
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const meetingsThisWeek =
    meetings?.filter((m) => {
      const meetingDate = new Date(m.date_time)
      return meetingDate >= startOfWeek && meetingDate < endOfWeek
    }).length || 0

  // Conversion rates
  const sqlToOppRate = sqls > 0 ? Math.round(((oppsActive + won + lost) / sqls) * 100) : 0
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0

  // ICP accounts (fit_comercial = 'Alto')
  const icpAccounts = accounts?.filter((a) => a.fit_comercial === "Alto").length || 0

  // Scorecard aggregations
  const cashCollected = scorecards?.reduce((sum, s) => sum + Number(s.cash_collected || 0), 0) || 0
  const mrrGenerated = scorecards?.reduce((sum, s) => sum + Number(s.mrr_generated || 0), 0) || 0

  return {
    totalAccounts,
    leads,
    sqls,
    oppsActive,
    won,
    lost,
    mrrPipeline,
    mrrWon,
    upcomingMeetings,
    meetingsThisWeek,
    sqlToOppRate,
    winRate,
    icpAccounts,
    cashCollected,
    mrrGenerated,
    // By country breakdown for global view
    byCountry: isGlobal ? await getMetricsByCountry(activeCodes) : undefined,
  }
}

async function getMetricsByCountry(countryCodes: string[]) {
  const supabase = await createClient()

  const results: Record<string, { accounts: number; sqls: number; mrr: number }> = {}

  for (const code of countryCodes) {
    const [{ count: accountsCount }, { data: opps }] = await Promise.all([
      supabase.from("accounts").select("*", { count: "exact", head: true }).eq("country_code", code),
      supabase.from("opportunities").select("mrr, stage").eq("country_code", code).eq("stage", "won"),
    ])

    results[code] = {
      accounts: accountsCount || 0,
      sqls: 0,
      mrr: opps?.reduce((sum, o) => sum + Number(o.mrr || 0), 0) || 0,
    }
  }

  return results
}
