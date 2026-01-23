"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ResourceLink } from "@/lib/types"
import {
  Search,
  Plus,
  ExternalLink,
  FileText,
  Video,
  FileCheck,
  DollarSign,
  Scale,
  Rocket,
  Pencil,
  Trash2,
  Presentation,
} from "lucide-react"
import { toast } from "sonner"

interface ResourcesPageProps {
  params: Promise<{ country: string }>
}

const categoryConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  decks: { label: "Decks", icon: Presentation, color: "bg-blue-100 text-blue-700" },
  casos: { label: "Casos de éxito", icon: FileCheck, color: "bg-green-100 text-green-700" },
  objeciones: { label: "Objeciones", icon: FileText, color: "bg-yellow-100 text-yellow-700" },
  pricing: { label: "Pricing", icon: DollarSign, color: "bg-purple-100 text-purple-700" },
  looms: { label: "Looms / Videos", icon: Video, color: "bg-red-100 text-red-700" },
  legal: { label: "Legal / Compras", icon: Scale, color: "bg-gray-100 text-gray-700" },
  implementacion: { label: "Implementación", icon: Rocket, color: "bg-cyan-100 text-cyan-700" },
}

export default function ResourcesPage() {
  const { country } = useParams<{ country: string }>()
  const { resources, addResource, updateResource, deleteResource, teamMembers } = useAppStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<ResourceLink | null>(null)
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    url: "",
    category: "decks" as ResourceLink["category"],
  })

  const countryResources = useMemo(() => {
    let filtered = resources.filter((r) => r.countryCode === country)

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [resources, country, searchQuery])

  const groupedResources = useMemo(() => {
    const grouped: Record<string, ResourceLink[]> = {}
    for (const resource of countryResources) {
      if (!grouped[resource.category]) {
        grouped[resource.category] = []
      }
      grouped[resource.category].push(resource)
    }
    return grouped
  }, [countryResources])

  const handleCreateResource = () => {
    if (!newResource.title || !newResource.url) {
      toast.error("Completa título y URL")
      return
    }
    addResource({
      id: Math.random().toString(36).substring(2, 11),
      countryCode: country,
      category: newResource.category,
      title: newResource.title,
      description: newResource.description,
      url: newResource.url,
      ownerId: teamMembers[0]?.id || "",
      updatedAt: new Date().toISOString(),
    })
    setNewResource({ title: "", description: "", url: "", category: "decks" })
    setIsNewDialogOpen(false)
    toast.success("Recurso creado")
  }

  const handleUpdateResource = () => {
    if (!editingResource) return
    updateResource(editingResource.id, {
      ...editingResource,
      updatedAt: new Date().toISOString(),
    })
    setEditingResource(null)
    toast.success("Recurso actualizado")
  }

  const handleDeleteResource = (id: string) => {
    deleteResource(id)
    toast.success("Recurso eliminado")
  }

  const getOwnerName = (ownerId: string) => {
    const member = teamMembers.find((m) => m.id === ownerId)
    return member?.name || "Sin asignar"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recursos de Venta</h1>
          <p className="text-muted-foreground">Biblioteca de materiales comerciales</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar recurso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo recurso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={newResource.category}
                  onValueChange={(v) => setNewResource({ ...newResource, category: v as ResourceLink["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="Deck Comercial 2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Presentación principal..."
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateResource}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar recursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Resources by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const categoryResources = groupedResources[key] || []
          const Icon = config.icon

          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {config.label}
                </CardTitle>
                <CardDescription>{categoryResources.length} recursos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center gap-2 hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{resource.title}</p>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground">{resource.description}</p>
                        )}
                      </div>
                    </a>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingResource(resource)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categoryResources.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">Sin recursos en esta categoría</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar recurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={editingResource?.category || "decks"}
                onValueChange={(v) =>
                  setEditingResource((prev) => (prev ? { ...prev, category: v as ResourceLink["category"] } : null))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editingResource?.title || ""}
                onChange={(e) => setEditingResource((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={editingResource?.description || ""}
                onChange={(e) => setEditingResource((prev) => (prev ? { ...prev, description: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={editingResource?.url || ""}
                onChange={(e) => setEditingResource((prev) => (prev ? { ...prev, url: e.target.value } : null))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResource(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateResource}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
