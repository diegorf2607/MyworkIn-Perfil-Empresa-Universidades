"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import MyWorkInLogo from "@/components/MyWorkInLogo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Building2,
  TrendingUp,
  DollarSign,
  Plus,
  MoreVertical,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  Calendar,
  Globe,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { getCountries, addCountry, updateCountry, deleteCountry } from "@/lib/actions/countries"
import { getAccounts } from "@/lib/actions/accounts"
import { getOpportunities } from "@/lib/actions/opportunities"
import { getMeetings } from "@/lib/actions/meetings"
import { createClient } from "@/lib/supabase/client"

interface Country {
  code: string
  name: string
  active: boolean
}

interface CountryStats {
  totalAccounts: number
  activeOpps: number
  pendingMeetings: number
  totalMrr: number
}

export default function CountriesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [countries, setCountries] = useState<Country[]>([])
  const [stats, setStats] = useState<Record<string, CountryStats>>({})
  const [globalStats, setGlobalStats] = useState<CountryStats>({
    totalAccounts: 0,
    activeOpps: 0,
    pendingMeetings: 0,
    totalMrr: 0,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCountry, setNewCountry] = useState({ code: "", name: "" })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [countriesData, accountsData, oppsData, meetingsData] = await Promise.all([
        getCountries(),
        getAccounts(),
        getOpportunities(),
        getMeetings(),
      ])

      setCountries(countriesData || [])

      const statsMap: Record<string, CountryStats> = {}
      const globalTotals = { totalAccounts: 0, activeOpps: 0, pendingMeetings: 0, totalMrr: 0 }

      for (const country of (countriesData || []).filter((c) => c.active)) {
        const countryAccounts = (accountsData || []).filter((a) => a.country_code === country.code)
        const countryOpps = (oppsData || []).filter((o) => o.country_code === country.code)
        const countryMeetings = (meetingsData || []).filter((m) => m.country_code === country.code)

        const countryStats = {
          totalAccounts: countryAccounts.length,
          activeOpps: countryOpps.filter((o) => !["won", "lost"].includes(o.stage || "")).length,
          pendingMeetings: countryMeetings.filter((m) => m.outcome === "pending").length,
          totalMrr: countryOpps.filter((o) => o.stage === "won").reduce((sum, o) => sum + Number(o.mrr || 0), 0),
        }

        statsMap[country.code] = countryStats

        // Accumulate global totals
        globalTotals.totalAccounts += countryStats.totalAccounts
        globalTotals.activeOpps += countryStats.activeOpps
        globalTotals.pendingMeetings += countryStats.pendingMeetings
        globalTotals.totalMrr += countryStats.totalMrr
      }
      setStats(statsMap)
      setGlobalStats(globalTotals)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeCountries = countries.filter((c) => c.active)
  const inactiveCountries = countries.filter((c) => !c.active)

  const handleAddCountry = () => {
    if (!newCountry.code || !newCountry.name) {
      toast.error("Completa todos los campos")
      return
    }

    const codeUpper = newCountry.code.toUpperCase()
    if (countries.some((c) => c.code === codeUpper)) {
      toast.error("Ya existe un país con ese código")
      return
    }

    startTransition(async () => {
      try {
        await addCountry(codeUpper, newCountry.name)
        toast.success(`${newCountry.name} agregado correctamente`)
        setNewCountry({ code: "", name: "" })
        setDialogOpen(false)
        loadData()
      } catch (error) {
        toast.error("Error al agregar país")
        console.error(error)
      }
    })
  }

  const handleToggleActive = (code: string, currentActive: boolean) => {
    startTransition(async () => {
      try {
        await updateCountry(code, { active: !currentActive })
        toast.success(currentActive ? "País desactivado" : "País activado")
        loadData()
      } catch (error) {
        toast.error("Error al actualizar país")
        console.error(error)
      }
    })
  }

  const handleDeleteCountry = (code: string, name: string) => {
    const countryStats = stats[code]
    if (countryStats && countryStats.totalAccounts > 0) {
      toast.error(`No se puede eliminar ${name} porque tiene datos asociados`)
      return
    }

    startTransition(async () => {
      try {
        await deleteCountry(code)
        toast.success(`${name} eliminado`)
        loadData()
      } catch (error) {
        toast.error("Error al eliminar país")
        console.error(error)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="border-b border-slate-200/80 bg-gradient-to-r from-[#005691] via-[#005691] to-[#0078D4] shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MyWorkInLogo variant="horizontal" size="lg" className="text-white" />
              <div className="text-white">
                <h1 className="text-3xl font-bold tracking-tight">MyWorkIn CRM</h1>
                <p className="text-white/90 mt-1">Selecciona un país para comenzar</p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2 bg-white/95 hover:bg-white text-[#005691] font-semibold shadow-md hover:shadow-lg transition-all border-0">
                  <Plus className="h-4 w-4" />
                  Agregar País
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar nuevo país</DialogTitle>
                  <DialogDescription>Ingresa el código ISO y nombre del país que deseas agregar.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Código ISO (2 letras)</Label>
                    <Input
                      id="code"
                      placeholder="BR"
                      maxLength={2}
                      value={newCountry.code}
                      onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del país</Label>
                    <Input
                      id="name"
                      placeholder="Brasil"
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCountry} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Agregar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <Card
            className="cursor-pointer border-2 border-[#005691]/20 bg-gradient-to-br from-[#005691]/5 via-[#0078D4]/5 to-[#005691]/5 transition-all hover:border-[#0078D4]/40 hover:shadow-xl hover:shadow-[#0078D4]/10 group"
            onClick={() => router.push("/all/overview")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#005691] to-[#0078D4] text-white shadow-lg group-hover:scale-105 transition-transform">
                    <Globe className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Todos los países</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">Ver métricas consolidadas de {activeCountries.length} países</CardDescription>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-[#005691] to-[#0078D4] hover:from-[#004578] hover:to-[#0066B3] text-white shadow-md hover:shadow-lg transition-all">
                  Ver dashboard global
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#005691]/10 to-[#005691]/20">
                    <Building2 className="h-5 w-5 text-[#005691]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{globalStats.totalAccounts}</p>
                    <p className="text-xs text-slate-600 font-medium">Universidades</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{globalStats.activeOpps}</p>
                    <p className="text-xs text-slate-600 font-medium">Opps activas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50/50 hover:bg-orange-100/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{globalStats.pendingMeetings}</p>
                    <p className="text-xs text-slate-600 font-medium">Reuniones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50/50 hover:bg-green-100/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">${globalStats.totalMrr.toLocaleString()}</p>
                    <p className="text-xs text-slate-600 font-medium">MRR Won</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Países activos</h2>
          <p className="text-sm text-slate-600">{activeCountries.length} países configurados en tu cuenta</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activeCountries.map((country) => {
            const countryStats = stats[country.code] || {
              totalAccounts: 0,
              activeOpps: 0,
              pendingMeetings: 0,
              totalMrr: 0,
            }

            return (
              <Card
                key={country.code}
                className="group relative cursor-pointer transition-all hover:border-[#0078D4]/40 hover:shadow-xl hover:shadow-[#0078D4]/5 border-slate-200 bg-white"
                onClick={() => router.push(`/c/${country.code}/scorecards`)}
              >
                <div
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(country.code, country.active)}>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Desactivar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteCountry(country.code, country.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-slate-900">{country.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs font-semibold bg-slate-100 text-slate-700">
                      {country.code}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-600 mt-1">Ver dashboard del país</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/50">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#005691]/10 to-[#005691]/20">
                        <Building2 className="h-4 w-4 text-[#005691]" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{countryStats.totalAccounts}</p>
                        <p className="text-xs text-slate-600 font-medium">Universidades</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{countryStats.activeOpps}</p>
                        <p className="text-xs text-slate-600 font-medium">Opps activas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50/50">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{countryStats.pendingMeetings}</p>
                        <p className="text-xs text-slate-600 font-medium">Reuniones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">${countryStats.totalMrr.toLocaleString()}</p>
                        <p className="text-xs text-slate-600 font-medium">MRR Won</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {activeCountries.length === 0 && (
          <Card className="p-12 text-center border-dashed border-2 border-slate-300 bg-slate-50/50">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                <Globe className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700">No hay países activos</p>
              <p className="text-sm text-slate-500">Agrega o activa un país para comenzar</p>
            </div>
          </Card>
        )}

        {inactiveCountries.length > 0 && (
          <div className="mt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Países inactivos</h2>
              <p className="text-sm text-muted-foreground">
                {inactiveCountries.length} países disponibles para activar
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {inactiveCountries.map((country) => (
                <Card
                  key={country.code}
                  className="flex items-center justify-between p-4 opacity-60 transition-opacity hover:opacity-100"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{country.code}</Badge>
                    <span className="font-medium">{country.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleActive(country.code, country.active)}>
                        <Power className="mr-2 h-4 w-4" />
                        Activar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteCountry(country.code, country.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer con botón de cerrar sesión */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-6 mt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
                router.refresh();
              }}
              className="gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
