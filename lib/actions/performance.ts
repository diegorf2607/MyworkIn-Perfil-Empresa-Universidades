"use server"

import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/utils/date-range"

// Get team members with their assigned countries
export async function getTeamMembersWithCountries() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from("team_members")
    .select(`
      *,
      team_member_countries(country_code)
    `)
    .eq("is_active", true)
    .order("name")

  if (error) throw error

  return (
    members?.map((m) => ({
      ...m,
      countries: m.team_member_countries?.map((c: { country_code: string }) => c.country_code) || [],
    })) || []
  )
}

// Get activity metrics for a team member in a date range
export async function getActivityMetrics(memberId: string, dateRange: DateRange, countryCode?: string) {
  const supabase = await createClient()

  // Accounts created (universities/leads)
  let accountsQuery = supabase
    .from("accounts")
    .select("id, stage, created_at", { count: "exact" })
    .eq("owner_id", memberId)
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    accountsQuery = accountsQuery.eq("country_code", countryCode)
  }

  const { data: accounts, count: accountsCount } = await accountsQuery

  const universidadesCreadas = accounts?.filter((a) => a.stage === "university").length || 0
  const leadsCreados = accounts?.filter((a) => a.stage === "lead").length || 0

  // Activities (emails, follow-ups)
  let activitiesQuery = supabase
    .from("activities")
    .select("id, type, date_time", { count: "exact" })
    .eq("owner_id", memberId)
    .gte("date_time", dateRange.from.toISOString())
    .lte("date_time", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    activitiesQuery = activitiesQuery.eq("country_code", countryCode)
  }

  const { data: activities } = await activitiesQuery

  const correosEnviados = activities?.filter((a) => a.type === "email").length || 0
  const followUpsEjecutados = activities?.filter((a) => a.type === "follow_up" || a.type === "call").length || 0

  // KDMs created - check account_kdm_contacts linked by this user's accounts
  const kdmsQuery = supabase
    .from("kdm_contacts")
    .select("id, created_at", { count: "exact" })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString())

  const { count: kdmsCount } = await kdmsQuery

  // Calculate active days (days with at least one activity)
  const activeDays = new Set(
    [...(accounts || []), ...(activities || [])].map((item) =>
      new Date(item.created_at || item.date_time).toDateString(),
    ),
  ).size

  return {
    universidadesCreadas,
    leadsCreados,
    kdmsCreados: kdmsCount || 0,
    correosEnviados,
    followUpsEjecutados,
    diasActivos: activeDays,
  }
}

// Get results metrics for a team member
export async function getResultsMetrics(memberId: string, dateRange: DateRange, countryCode?: string) {
  const supabase = await createClient()

  // SQLs generated (accounts with stage = 'sql')
  let sqlsQuery = supabase
    .from("accounts")
    .select("id", { count: "exact" })
    .eq("owner_id", memberId)
    .eq("stage", "sql")
    .gte("updated_at", dateRange.from.toISOString())
    .lte("updated_at", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    sqlsQuery = sqlsQuery.eq("country_code", countryCode)
  }

  const { count: sqlsCount } = await sqlsQuery

  // Meetings
  let meetingsQuery = supabase
    .from("meetings")
    .select("id, outcome, date_time", { count: "exact" })
    .eq("owner_id", memberId)
    .gte("date_time", dateRange.from.toISOString())
    .lte("date_time", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    meetingsQuery = meetingsQuery.eq("country_code", countryCode)
  }

  const { data: meetings } = await meetingsQuery

  const reunionesAgendadas = meetings?.length || 0
  const reunionesCompletadas =
    meetings?.filter((m) => m.outcome === "completed" || m.outcome === "positivo" || m.outcome === "neutro").length || 0
  const noShows = meetings?.filter((m) => m.outcome === "no_show").length || 0

  // Deals (opportunities)
  let dealsQuery = supabase
    .from("opportunities")
    .select("id, stage, mrr, closed_at")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    dealsQuery = dealsQuery.eq("country_code", countryCode)
  }

  const { data: deals } = await dealsQuery

  const dealsGanados = deals?.filter((d) => d.stage === "won").length || 0
  const mrrGenerado = deals?.filter((d) => d.stage === "won").reduce((sum, d) => sum + (Number(d.mrr) || 0), 0) || 0

  return {
    sqlsGenerados: sqlsCount || 0,
    reunionesAgendadas,
    reunionesCompletadas,
    noShows,
    dealsGanados,
    mrrGenerado,
  }
}

// Get weekly summary for all team
export async function getWeeklySummary(dateRange: DateRange, countryCode?: string) {
  const supabase = await createClient()

  let accountsQuery = supabase
    .from("accounts")
    .select("id, stage", { count: "exact" })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    accountsQuery = accountsQuery.eq("country_code", countryCode)
  }

  const { data: accounts } = await accountsQuery

  let activitiesQuery = supabase
    .from("activities")
    .select("id, type")
    .gte("date_time", dateRange.from.toISOString())
    .lte("date_time", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    activitiesQuery = activitiesQuery.eq("country_code", countryCode)
  }

  const { data: activities } = await activitiesQuery

  let meetingsQuery = supabase
    .from("meetings")
    .select("id, outcome")
    .gte("date_time", dateRange.from.toISOString())
    .lte("date_time", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    meetingsQuery = meetingsQuery.eq("country_code", countryCode)
  }

  const { data: meetings } = await meetingsQuery

  let oppsQuery = supabase
    .from("opportunities")
    .select("id, stage, mrr")
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString())

  if (countryCode && countryCode !== "todos") {
    oppsQuery = oppsQuery.eq("country_code", countryCode)
  }

  const { data: opps } = await oppsQuery

  return {
    universidadesCreadas: accounts?.filter((a) => a.stage === "university").length || 0,
    leadsCreados: accounts?.filter((a) => a.stage === "lead").length || 0,
    kdmsCreados: 0, // TODO: proper KDM tracking
    correosEnviados: activities?.filter((a) => a.type === "email").length || 0,
    reunionesAgendadas: meetings?.length || 0,
    reunionesCompletadas: meetings?.filter((m) => m.outcome && m.outcome !== "pending").length || 0,
    sqlsGenerados: accounts?.filter((a) => a.stage === "sql").length || 0,
    dealsGanados: opps?.filter((o) => o.stage === "won").length || 0,
    mrrGenerado: opps?.filter((o) => o.stage === "won").reduce((sum, o) => sum + (Number(o.mrr) || 0), 0) || 0,
  }
}

// Get activity log for tabla-actividad
export async function getActivityLog(
  dateRange: DateRange,
  filters?: {
    usuario?: string
    rol?: string
    tipoAccion?: string
    countryCode?: string
    search?: string
  },
) {
  const supabase = await createClient()

  // Get activities
  let query = supabase
    .from("activities")
    .select(`
      id,
      type,
      subject,
      summary,
      date_time,
      owner_id,
      account_id,
      country_code,
      accounts(name, stage)
    `)
    .gte("date_time", dateRange.from.toISOString())
    .lte("date_time", dateRange.to.toISOString())
    .order("date_time", { ascending: false })
    .limit(200)

  if (filters?.countryCode && filters.countryCode !== "todos") {
    query = query.eq("country_code", filters.countryCode)
  }

  if (filters?.usuario && filters.usuario !== "todos") {
    query = query.eq("owner_id", filters.usuario)
  }

  const { data: activities, error } = await query

  if (error) throw error

  // Get team members for mapping
  const { data: members } = await supabase.from("team_members").select("id, name, role")

  const memberMap = new Map(members?.map((m) => [m.id, m]) || [])

  // Map to activity log format
  return (
    activities?.map((a) => {
      const member = memberMap.get(a.owner_id)
      return {
        id: a.id,
        usuario: member?.name || "Desconocido",
        usuarioId: a.owner_id,
        rol: member?.role || "SDR",
        tipoAccion: mapActivityType(a.type),
        entidad: (a.accounts as { name: string } | null)?.name || "Sin entidad",
        entidadTipo: mapStageToEntityType((a.accounts as { stage: string } | null)?.stage),
        entidadId: a.account_id,
        canal: a.type === "email" ? "email" : a.type === "call" ? "telefono" : "sistema",
        fechaHora: a.date_time,
        metadata: {
          subject: a.subject,
          summary: a.summary,
        },
      }
    }) || []
  )
}

function mapActivityType(type: string): string {
  const mapping: Record<string, string> = {
    email: "correo_enviado",
    call: "llamada",
    note: "nota",
    follow_up: "follow_up",
    meeting: "reunion_agendada",
  }
  return mapping[type] || type
}

function mapStageToEntityType(stage: string | undefined): string {
  if (!stage) return "otro"
  const mapping: Record<string, string> = {
    university: "universidad",
    lead: "lead",
    sql: "sql",
    opp: "oportunidad",
    won: "deal",
    lost: "deal",
  }
  return mapping[stage] || "otro"
}

// Get funnel data
export async function getFunnelData(dateRange: DateRange, countryCode?: string) {
  const supabase = await createClient()

  // Get counts for each stage
  const stages = ["university", "lead", "sql", "opp", "won"]
  const results: Record<string, number> = {}

  for (const stage of stages) {
    let query = supabase.from("accounts").select("id", { count: "exact", head: true })

    if (stage === "won" || stage === "lost") {
      // For won/lost, check opportunities table
      let oppQuery = supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("stage", stage)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())

      if (countryCode && countryCode !== "todos") {
        oppQuery = oppQuery.eq("country_code", countryCode)
      }

      const { count } = await oppQuery
      results[stage] = count || 0
    } else {
      query = query
        .eq("stage", stage)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())

      if (countryCode && countryCode !== "todos") {
        query = query.eq("country_code", countryCode)
      }

      const { count } = await query
      results[stage] = count || 0
    }
  }

  // Build funnel with conversion rates
  const funnel = [
    { etapa: "Universidades", cantidad: results.university || 0 },
    { etapa: "Leads (ICP)", cantidad: results.lead || 0 },
    { etapa: "SQLs", cantidad: results.sql || 0 },
    { etapa: "Oportunidades", cantidad: results.opp || 0 },
    { etapa: "Deals Ganados", cantidad: results.won || 0 },
  ]

  // Calculate conversions
  let lowestConversion = 100
  let weakestPoint = ""

  const funnelWithConversions = funnel.map((item, index) => {
    if (index === 0) {
      return { ...item, conversion: 100 }
    }
    const prevCantidad = funnel[index - 1].cantidad
    const conversion = prevCantidad > 0 ? Math.round((item.cantidad / prevCantidad) * 100) : 0

    if (conversion < lowestConversion && prevCantidad > 0) {
      lowestConversion = conversion
      weakestPoint = `${funnel[index - 1].etapa} → ${item.etapa}`
    }

    return { ...item, conversion }
  })

  return {
    funnel: funnelWithConversions,
    weakestPoint,
    weakestConversion: lowestConversion,
  }
}
