"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ExternalLink, Plus, Pencil, Trash2, Target, Rocket, Loader2, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { getQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink } from "@/lib/actions/quick-links"
import { getCountryByCode } from "@/lib/actions/countries"
import { getAppSettings, updateAppSettings } from "@/lib/actions/settings"

interface QuickLink {
  id: string
  country_code: string
  title: string
  url: string
  category: string
}

interface Country {
  code: string
  name: string
}

interface AppSettings {
  id: string
  north_star_text: string | null
  hero_text: string | null
}

export default function OverviewPage() {
  const { country } = useParams<{ country: string }>()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([])
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const [editingLink, setEditingLink] = useState<QuickLink | null>(null)
  const [newLink, setNewLink] = useState({ title: "", url: "", category: "Ventas" })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [editingNorthStar, setEditingNorthStar] = useState(false)
  const [editingHero, setEditingHero] = useState(false)
  const [northStarText, setNorthStarText] = useState("")
  const [heroText, setHeroText] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [linksData, countryData, settingsData] = await Promise.all([
        getQuickLinks(country),
        getCountryByCode(country),
        getAppSettings(),
      ])
      setQuickLinks((linksData as QuickLink[]) || [])
      setCurrentCountry(countryData as Country | null)
      setSettings(settingsData as AppSettings | null)
      setNorthStarText(
        settingsData?.north_star_text ||
          "Ser la plataforma líder de empleabilidad universitaria en LATAM, conectando a 200+ universidades y alcanzando 1M+ estudiantes y egresados para transformar su futuro profesional.",
      )
      setHeroText(
        settingsData?.hero_text ||
          "Impulsamos la empleabilidad universitaria en LATAM conectando estudiantes con oportunidades reales.",
      )
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error("Completa todos los campos")
      return
    }
    startTransition(async () => {
      try {
        await createQuickLink({
          country_code: country,
          title: newLink.title,
          url: newLink.url,
          category: newLink.category,
        })
        setNewLink({ title: "", url: "", category: "Ventas" })
        setIsAddDialogOpen(false)
        toast.success("Link agregado")
        loadData()
      } catch (error) {
        toast.error("Error al agregar link")
        console.error(error)
      }
    })
  }

  const handleUpdateLink = () => {
    if (!editingLink) return
    startTransition(async () => {
      try {
        await updateQuickLink({
          id: editingLink.id,
          title: editingLink.title,
          url: editingLink.url,
          category: editingLink.category,
        })
        setEditingLink(null)
        toast.success("Link actualizado")
        loadData()
      } catch (error) {
        toast.error("Error al actualizar link")
        console.error(error)
      }
    })
  }

  const handleDeleteLink = (id: string) => {
    startTransition(async () => {
      try {
        await deleteQuickLink(id)
        toast.success("Link eliminado")
        loadData()
      } catch (error) {
        toast.error("Error al eliminar link")
        console.error(error)
      }
    })
  }

  const handleSaveNorthStar = () => {
    startTransition(async () => {
      try {
        await updateAppSettings({ north_star_text: northStarText })
        setEditingNorthStar(false)
        toast.success("North Star actualizado")
        loadData()
      } catch (error) {
        toast.error("Error al actualizar")
        console.error(error)
      }
    })
  }

  const handleSaveHero = () => {
    startTransition(async () => {
      try {
        await updateAppSettings({ hero_text: heroText })
        setEditingHero(false)
        toast.success("Texto actualizado")
        loadData()
      } catch (error) {
        toast.error("Error al actualizar")
        console.error(error)
      }
    })
  }

  const linkCategories = [...new Set(quickLinks.map((l) => l.category))]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="border-none bg-primary text-white">
        <CardContent className="flex items-center gap-6 p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Rocket className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Somos el equipo de crecimiento de MyWorkIn</h1>
            {editingHero ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={heroText}
                  onChange={(e) => setHeroText(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={handleSaveHero} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingHero(false)}
                    className="text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-white/90 group cursor-pointer" onClick={() => setEditingHero(true)}>
                {heroText}
                <Pencil className="ml-2 inline h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo / Quiénes somos card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <CardTitle className="text-lg">Resumen Ejecutivo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Quiénes somos</h3>
            <p className="text-muted-foreground leading-relaxed">
              MyWorkIn es una plataforma de empleabilidad para universidades. Ayudamos a conectar a sus
              estudiantes/egresados con oportunidades laborales y ofrecemos a las instituciones bolsas de trabajo,
              herramientas de IA y la automatización de procesos internos.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Qué hacemos</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Para estudiantes y egresados */}
              <div className="rounded-xl border bg-slate-50 p-5">
                <h4 className="font-semibold text-primary mb-3">Para estudiantes y egresados</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Bolsa de trabajo con match</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Herramientas de IA (CV, Entrevistas, LinkedIn y Aprendizaje)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Solicitud de documentos / asesorías</span>
                  </li>
                </ul>
              </div>

              {/* Para universidades */}
              <div className="rounded-xl border bg-slate-50 p-5">
                <h4 className="font-semibold text-primary mb-3">Para universidades</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Procesos académicos y administrativos</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Vínculo institucional y trazabilidad</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>Difusión de oportunidades y análisis de datos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* North Star Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>North Star 2026</CardTitle>
            <CardDescription>Nuestra visión y objetivos principales</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {editingNorthStar ? (
            <div className="space-y-3">
              <Textarea value={northStarText} onChange={(e) => setNorthStarText(e.target.value)} rows={3} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNorthStar} disabled={isPending}>
                  {isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingNorthStar(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p
              className="text-lg leading-relaxed text-foreground group cursor-pointer"
              onClick={() => setEditingNorthStar(true)}
            >
              {northStarText}
              <Pencil className="ml-2 inline h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      
    </div>
  )
}
