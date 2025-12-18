"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
} from "lucide-react"
import { toast } from "sonner"
import { getCountries, addCountry, updateCountry, deleteCountry } from "@/lib/actions/countries"
import { getAccounts } from "@/lib/actions/accounts"
import { getOpportunities } from "@/lib/actions/opportunities"
import { getMeetings } from "@/lib/actions/meetings"

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
      for (const country of countriesData || []) {
        const countryAccounts = (accountsData || []).filter((a) => a.country_code === country.code)
        const countryOpps = (oppsData || []).filter((o) => o.country_code === country.code)
        const countryMeetings = (meetingsData || []).filter((m) => m.country_code === country.code)

        statsMap[country.code] = {
          totalAccounts: countryAccounts.length,
          activeOpps: countryOpps.filter((o) => !["won", "lost"].includes(o.stage || "")).length,
          pendingMeetings: countryMeetings.filter((m) => m.outcome === "pending").length,
          totalMrr: countryOpps.filter((o) => o.stage === "won").reduce((sum, o) => sum + Number(o.mrr || 0), 0),
        }
      }
      setStats(statsMap)
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl p-2 text-transparent bg-popover">
                <Image
                  src="/images/myworkin-logo.png"
                  alt="MyWorkIn"
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">MyWorkIn CRM</h1>
                <p className="text-white/80">Selecciona un país para comenzar</p>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
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

      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Países activos</h2>
          <p className="text-sm text-muted-foreground">{activeCountries.length} países configurados en tu cuenta</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group relative cursor-pointer transition-all hover:border-primary hover:shadow-lg"
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

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{country.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {country.code}
                    </Badge>
                  </div>
                  <CardDescription>Ver dashboard del país</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{countryStats.totalAccounts}</p>
                        <p className="text-xs text-muted-foreground">Universidades</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{countryStats.activeOpps}</p>
                        <p className="text-xs text-muted-foreground">Opps activas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                        <Calendar className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{countryStats.pendingMeetings}</p>
                        <p className="text-xs text-muted-foreground">Reuniones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">${countryStats.totalMrr.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">MRR Won</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {activeCountries.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay países activos.</p>
            <p className="text-sm text-muted-foreground">Agrega o activa un país para comenzar.</p>
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
    </div>
  )
}
