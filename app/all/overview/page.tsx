"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, Trophy, XCircle, DollarSign, Calendar, Target, Globe, Loader2 } from "lucide-react"
import { getDashboardMetrics } from "@/lib/actions/dashboard"
import { getCountries } from "@/lib/actions/countries"

interface Metrics {
  totalAccounts: number
  leads: number
  sqls: number
  oppsActive: number
  won: number
  lost: number
  winRate: number
  mrrPipeline: number
  mrrWon: number
  upcomingMeetings: number
  byCountry?: Record<string, { accounts: number; sqls: number; mrr: number }>
}

interface Country {
  code: string
  name: string
  active: boolean
}

export default function GlobalOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, countriesData] = await Promise.all([
          getDashboardMetrics("ALL"),
          getCountries()
        ])
        setMetrics(metricsData)
        setCountries(countriesData || [])
      } catch (error) {
        console.error("Error loading overview data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#005691]" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Error al cargar datos</p>
      </div>
    )
  }

  const activeCountries = countries.filter((c) => c.active)

  const mainKpis = [
    { label: "Total Universidades", value: metrics.totalAccounts, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Leads Activos", value: metrics.leads, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Oportunidades", value: metrics.oppsActive, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "MRR Pipeline", value: `$${metrics.mrrPipeline.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  const secondaryKpis = [
    { label: "SQLs", value: metrics.sqls, icon: Target, color: "text-purple-600" },
    { label: "Won", value: metrics.won, icon: Trophy, color: "text-green-600" },
    { label: "Win Rate", value: `${metrics.winRate}%`, icon: Trophy, color: "text-emerald-600" },
    { label: "Lost", value: metrics.lost, icon: XCircle, color: "text-red-600" },
    { label: "MRR Won", value: `$${metrics.mrrWon.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Reuniones (7 días)", value: metrics.upcomingMeetings, icon: Calendar, color: "text-blue-600" },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pb-12">
      <div className="space-y-10 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vista Global</h1>
            <p className="text-slate-500 mt-1 text-lg">Panorama general de {activeCountries.length} países activos</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCountries.map((country) => (
              <Badge key={country.code} variant="secondary" className="px-3 py-1 text-sm font-medium bg-white border border-slate-200 shadow-sm">
                {country.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mainKpis.map((kpi) => (
            <Card key={kpi.label} className="border-none shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary KPIs */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 px-1">Métricas de Rendimiento</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {secondaryKpis.map((kpi) => (
              <Card key={kpi.label} className="border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white/50">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-lg bg-slate-50`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Country Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 px-1">Desglose por País</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCountries.map((country) => {
              const countryMetrics = metrics.byCountry?.[country.code]
              return (
                <Card key={country.code} className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-2 bg-[#005691] w-full" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-lg font-bold text-[#005691]">
                          {country.code}
                        </div>
                        <span className="font-bold text-lg text-slate-900">{country.name}</span>
                      </div>
                      <Globe className="h-5 w-5 text-slate-300 group-hover:text-[#005691] transition-colors" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{countryMetrics?.accounts || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Unis</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-2xl font-bold text-slate-900">{countryMetrics?.sqls || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">SQLs</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-2xl font-bold text-emerald-600">
                          ${(countryMetrics?.mrr || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">MRR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
