"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Users, TrendingUp } from "lucide-react"
import { GlobalFilters, type FilterState } from "@/components/performance/global-filters"
import { ResumenSemanalBlock } from "@/components/performance/resumen-semanal"
import { PerformanceTilesGrid, type PersonPerformance } from "@/components/performance/performance-tiles"
import { FunnelOutbound } from "@/components/performance/funnel-outbound"
import { Leaderboard } from "@/components/performance/leaderboard"
import { getDateRangeFromPreset, getPreviousPeriodRange, type PeriodoPreset } from "@/lib/utils/date-range"
import {
  getTeamMembersWithCountries,
  getWeeklySummary,
  getActivityMetrics,
  getResultsMetrics,
  getFunnelData,
} from "@/lib/actions/performance"
import { getActiveCountries } from "@/lib/actions/countries"

export default function VentasPage() {
  const [filters, setFilters] = useState<FilterState>({
    periodo: "ultimos_7",
    comparar: true,
    rol: "todos",
    usuario: "todos",
    pais: "todos",
  })

  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: string; name: string; role: string; countries: string[] }>
  >([])
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([])
  const [weeklySummary, setWeeklySummary] = useState<any>(null)
  const [previousSummary, setPreviousSummary] = useState<any>(null)
  const [performanceData, setPerformanceData] = useState<PersonPerformance[]>([])
  const [funnelData, setFunnelData] = useState<any>(null)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [members, countriesData] = await Promise.all([getTeamMembersWithCountries(), getActiveCountries()])
        setTeamMembers(
          members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role || "SDR",
            countries: m.countries || [],
          })),
        )
        setCountries(countriesData.map((c) => ({ code: c.code, name: c.name })))
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadInitialData()
  }, [])

  // Load performance data when filters change
  useEffect(() => {
    async function loadPerformanceData() {
      setLoading(true)
      try {
        const dateRange = getDateRangeFromPreset(filters.periodo as PeriodoPreset, filters.dateRange)
        const previousRange = getPreviousPeriodRange(dateRange)

        // Load summary
        const [summary, prevSummary, funnel] = await Promise.all([
          getWeeklySummary(dateRange, filters.pais !== "todos" ? filters.pais : undefined),
          filters.comparar
            ? getWeeklySummary(previousRange, filters.pais !== "todos" ? filters.pais : undefined)
            : null,
          getFunnelData(dateRange, filters.pais !== "todos" ? filters.pais : undefined),
        ])

        setWeeklySummary(summary)
        setPreviousSummary(prevSummary)
        setFunnelData(funnel)

        // Load per-person data
        const filteredMembers = teamMembers.filter((m) => {
          const matchesRol = filters.rol === "todos" || m.role === filters.rol
          const matchesUsuario = filters.usuario === "todos" || m.id === filters.usuario
          const matchesPais = filters.pais === "todos" || m.countries.includes(filters.pais)
          return matchesRol && matchesUsuario && matchesPais
        })

        const performancePromises = filteredMembers.map(async (member) => {
          const countryFilter = filters.pais !== "todos" ? filters.pais : undefined
          const [activity, results, prevActivity, prevResults] = await Promise.all([
            getActivityMetrics(member.id, dateRange, countryFilter),
            getResultsMetrics(member.id, dateRange, countryFilter),
            filters.comparar ? getActivityMetrics(member.id, previousRange, countryFilter) : null,
            filters.comparar ? getResultsMetrics(member.id, previousRange, countryFilter) : null,
          ])

          return {
            member: {
              id: member.id,
              name: member.name,
              role: member.role,
              country: member.countries[0] || "Global",
            },
            activity,
            engagement: {
              tasaEntrega: 95,
              tasaApertura: 42,
              tasaRespuesta: 8,
              tasaInteresados: 3,
              tasaOptOut: 0.5,
              tasaRebote: 2,
            },
            results,
            previousPeriod:
              filters.comparar && prevActivity && prevResults
                ? {
                    activity: prevActivity,
                    engagement: {
                      tasaEntrega: 94,
                      tasaApertura: 40,
                      tasaRespuesta: 7,
                      tasaInteresados: 2.5,
                      tasaOptOut: 0.6,
                      tasaRebote: 2.1,
                    },
                    results: prevResults,
                  }
                : undefined,
          } as PersonPerformance
        })

        const performance = await Promise.all(performancePromises)
        setPerformanceData(performance)
      } catch (error) {
        console.error("Error loading performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (teamMembers.length > 0) {
      loadPerformanceData()
    }
  }, [filters, teamMembers])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Filtros globales sticky - única fuente de verdad */}
      <GlobalFilters filters={filters} onFiltersChange={setFilters} teamMembers={teamMembers} countries={countries} />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Performance Comercial
          </h1>
          <p className="text-muted-foreground">Dashboard de control del equipo comercial</p>
        </div>

        {/* Resumen Semanal */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <ResumenSemanalBlock data={weeklySummary} previousData={previousSummary} showComparison={filters.comparar} />
        )}

        {/* Tabs para organizar contenido */}
        <Tabs defaultValue="equipo" className="space-y-4">
          <TabsList>
            <TabsTrigger value="equipo" className="gap-2">
              <Users className="h-4 w-4" />
              Por Persona
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Funnel
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipo" className="space-y-4">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : (
              <PerformanceTilesGrid data={performanceData} showComparison={filters.comparar} />
            )}
          </TabsContent>

          <TabsContent value="funnel">
            {loading ? <Skeleton className="h-96" /> : funnelData ? <FunnelOutbound data={funnelData} /> : null}
          </TabsContent>

          <TabsContent value="leaderboard">
            {loading ? <Skeleton className="h-96" /> : <Leaderboard data={performanceData} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
