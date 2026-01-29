"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, Trophy, XCircle, DollarSign, Calendar, Target, Globe, Loader2 } from "lucide-react"
import { useWorkspace } from "@/lib/context/workspace-context"

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
  byCountry?: Record<string, { accounts: number; sqls: number; mrr: number; mrrWon: number; opps: number }>
}

interface Country {
  code: string
  name: string
  active: boolean
}

export default function GlobalOverviewPage() {
  const { workspace, config } = useWorkspace()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dynamic colors based on workspace
  const primaryColor = config.theme.primary
  const accentColor = config.theme.accent
  const isMKN = workspace === "mkn"

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/dashboard?country=ALL&workspace=${workspace}`)
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || "Failed to load data")
        }
        
        setMetrics({
          ...data.metrics,
          byCountry: data.byCountry
        })
        setCountries(data.countries || [])
      } catch (err: any) {
        console.error("[Overview] Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [workspace])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">{error || "Error al cargar datos"}</p>
      </div>
    )
  }

  const activeCountries = countries.filter((c) => c.active)

  const mainKpis = [
    { 
      label: `Total ${config.terminology.entities}`, 
      value: metrics.totalAccounts, 
      icon: Building2, 
      color: isMKN ? "text-slate-900" : "text-blue-600", 
      bg: isMKN ? "bg-slate-100" : "bg-blue-50" 
    },
    { label: "Leads Activos", value: metrics.leads, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Oportunidades", value: metrics.oppsActive, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "MRR Won", value: `$${metrics.mrrWon.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  const secondaryKpis = [
    { label: "SQLs", value: metrics.sqls, icon: Target, color: "text-purple-600" },
    { label: "Won", value: metrics.won, icon: Trophy, color: "text-green-600" },
    { label: "Win Rate", value: `${metrics.winRate}%`, icon: Trophy, color: "text-emerald-600" },
    { label: "Lost", value: metrics.lost, icon: XCircle, color: "text-red-600" },
    { label: "MRR Pipeline", value: `$${metrics.mrrPipeline.toLocaleString()}`, icon: DollarSign, color: isMKN ? "text-slate-900" : "text-blue-600" },
    { label: "Reuniones (7 días)", value: metrics.upcomingMeetings, icon: Calendar, color: isMKN ? "text-slate-700" : "text-blue-600" },
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
                  <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                          style={{ 
                            backgroundColor: isMKN ? "#f1f5f9" : "#eff6ff",
                            color: primaryColor 
                          }}
                        >
                          {country.code}
                        </div>
                        <span className="font-bold text-lg text-slate-900">{country.name}</span>
                      </div>
                      <Globe 
                        className="h-5 w-5 text-slate-300 transition-colors" 
                        style={{ "--hover-color": primaryColor } as React.CSSProperties}
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 border-t border-slate-50 pt-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">{countryMetrics?.accounts || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{config.terminology.entityShort}</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-xl font-bold text-slate-900">{countryMetrics?.sqls || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">SQLs</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-xl font-bold text-emerald-600">
                          ${(countryMetrics?.mrrWon || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Won</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-xl font-bold" style={{ color: isMKN ? "#1e293b" : "#2563eb" }}>
                          ${(countryMetrics?.mrr || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">Pipeline</p>
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
