import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, TrendingUp, Trophy, XCircle, DollarSign, Calendar, Target, Globe } from "lucide-react"
import { getDashboardMetrics } from "@/lib/actions/dashboard"
import { getCountries } from "@/lib/actions/countries"

export default async function GlobalOverviewPage() {
  const [metrics, countries] = await Promise.all([getDashboardMetrics("ALL"), getCountries()])

  const activeCountries = countries?.filter((c) => c.active) || []

  const kpis = [
    { label: "Total Universidades", value: metrics.totalAccounts, icon: Building2, color: "text-primary" },
    { label: "Leads Activos", value: metrics.leads, icon: Users, color: "text-blue-600" },
    { label: "SQLs", value: metrics.sqls, icon: Target, color: "text-purple-600" },
    { label: "Oportunidades", value: metrics.oppsActive, icon: TrendingUp, color: "text-orange-600" },
    { label: "Won", value: metrics.won, icon: Trophy, color: "text-green-600" },
    { label: "Lost", value: metrics.lost, icon: XCircle, color: "text-red-600" },
    {
      label: "MRR Pipeline",
      value: `$${metrics.mrrPipeline.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-600",
    },
    { label: "MRR Won", value: `$${metrics.mrrWon.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Reuniones (7 días)", value: metrics.upcomingMeetings, icon: Calendar, color: "text-indigo-600" },
    { label: "Win Rate", value: `${metrics.winRate}%`, icon: Trophy, color: "text-emerald-600" },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#005691] to-[#0078D4] text-white shadow-lg">
                <Globe className="h-6 w-6" />
              </div>
              Vista Global
            </h1>
            <p className="text-slate-600 mt-2">Métricas consolidadas de {activeCountries.length} países activos</p>
          </div>
          <div className="flex gap-2">
            {activeCountries.slice(0, 5).map((country) => (
              <Badge key={country.code} variant="secondary">
                {country.code}
              </Badge>
            ))}
            {activeCountries.length > 5 && <Badge variant="outline">+{activeCountries.length - 5} más</Badge>}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-slate-200 bg-white hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1">{kpi.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Country Breakdown */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Desglose por País</CardTitle>
            <CardDescription className="text-slate-600">Métricas principales por cada país activo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCountries.map((country) => {
                const countryMetrics = metrics.byCountry?.[country.code]
                return (
                  <Card key={country.code} className="bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#005691] text-white font-semibold">{country.code}</Badge>
                          <span className="font-semibold text-slate-900">{country.name}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 rounded-lg bg-white">
                          <p className="text-lg font-bold text-slate-900">{countryMetrics?.accounts || 0}</p>
                          <p className="text-xs text-slate-600 font-medium">Unis</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white">
                          <p className="text-lg font-bold text-slate-900">{countryMetrics?.sqls || 0}</p>
                          <p className="text-xs text-slate-600 font-medium">SQLs</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white">
                          <p className="text-lg font-bold text-green-600">
                            ${(countryMetrics?.mrr || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-600 font-medium">MRR</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
