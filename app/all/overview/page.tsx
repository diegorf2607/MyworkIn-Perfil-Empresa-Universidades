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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Vista Global
          </h1>
          <p className="text-muted-foreground">Métricas consolidadas de {activeCountries.length} países activos</p>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Country Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por País</CardTitle>
          <CardDescription>Métricas principales por cada país activo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCountries.map((country) => {
              const countryMetrics = metrics.byCountry?.[country.code]
              return (
                <Card key={country.code} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge>{country.code}</Badge>
                        <span className="font-medium">{country.name}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{countryMetrics?.accounts || 0}</p>
                        <p className="text-xs text-muted-foreground">Unis</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{countryMetrics?.sqls || 0}</p>
                        <p className="text-xs text-muted-foreground">SQLs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          ${(countryMetrics?.mrr || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">MRR</p>
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
  )
}
