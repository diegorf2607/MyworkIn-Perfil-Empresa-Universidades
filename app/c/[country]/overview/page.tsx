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
import { useWorkspace } from "@/lib/context/workspace-context"

interface QuickLink {
  id: string
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
  const { workspace, config } = useWorkspace()
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

  // Get overview content from workspace config
  const overviewContent = config.overview

  const loadData = useCallback(async () => {
    try {
      const [linksData, countryData, settingsData] = await Promise.all([
        getQuickLinks(),
        getCountryByCode(country),
        getAppSettings(),
      ])
      setQuickLinks((linksData || []) as QuickLink[])
      setCurrentCountry(countryData as Country | null)
      const appSettings = settingsData as AppSettings | null
      if (appSettings) {
        setSettings(appSettings)
        setNorthStarText(appSettings.north_star_text || overviewContent.northStar.defaultText)
        setHeroText(appSettings.hero_text || overviewContent.banner.defaultSubtitle)
      } else {
        setNorthStarText(overviewContent.northStar.defaultText)
        setHeroText(overviewContent.banner.defaultSubtitle)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country, overviewContent])

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

  // Dynamic primary color based on workspace
  const primaryColor = config.theme.primary
  const isPrimaryDark = workspace === "mkn"

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card 
        className="border-none text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <CardContent className="flex items-center gap-6 p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Rocket className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{overviewContent.banner.title}</h1>
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
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: isPrimaryDark ? "#000" : "#10b981" }}
            />
            <CardTitle className="text-lg">{overviewContent.summary.header}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-8 space-y-6">
          <div>
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: primaryColor }}
            >
              {overviewContent.summary.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {overviewContent.summary.body}
            </p>
          </div>

          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: primaryColor }}
            >
              {overviewContent.whatWeDo.title}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {overviewContent.whatWeDo.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className="rounded-xl border p-5"
                  style={{ backgroundColor: isPrimaryDark ? "#f8f8f8" : "#f8fafc" }}
                >
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: primaryColor }}
                  >
                    {card.title}
                  </h4>
                  <ul className="space-y-2">
                    {card.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight 
                          className="h-4 w-4 mt-0.5 shrink-0"
                          style={{ color: primaryColor }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* North Star Card */}
      <Card>
        <CardHeader className="p-8 pb-0 flex flex-row items-center gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Target className="h-6 w-6" style={{ color: primaryColor }} />
          </div>
          <div>
            <CardTitle>{overviewContent.northStar.title}</CardTitle>
            <CardDescription>{overviewContent.northStar.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          {editingNorthStar ? (
            <div className="space-y-3">
              <Textarea value={northStarText} onChange={(e) => setNorthStarText(e.target.value)} rows={3} />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveNorthStar} 
                  disabled={isPending}
                  style={{ backgroundColor: primaryColor, color: "#fff" }}
                >
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
