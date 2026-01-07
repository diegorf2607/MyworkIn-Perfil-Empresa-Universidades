"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  ExternalLink,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  Presentation,
  FileCheck,
  DollarSign,
  Video,
  Scale,
  Rocket,
  FolderPlus,
} from "lucide-react"
import { toast } from "sonner"
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  getResourceCategories,
  createResourceCategory,
  type ResourceCategory,
} from "@/lib/actions/resources"

const iconMap: Record<string, React.ElementType> = {
  Presentation,
  FileCheck,
  FileText,
  DollarSign,
  Video,
  Scale,
  Rocket,
}

type Resource = {
  id: string
  category: string
  title: string
  description: string | null
  url: string
  country_code: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
  team_members: { name: string } | null
}

export default function RecursosContent() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
  })
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [resourcesData, categoriesData] = await Promise.all([getResources(), getResourceCategories()])
      setResources(resourcesData)
      setCategories(categoriesData)
      if (categoriesData.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: categoriesData[0].name }))
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar recursos")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!formData.title || !formData.url || !formData.category) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    try {
      if (editingResource) {
        await updateResource({ id: editingResource.id, ...formData })
        toast.success("Recurso actualizado")
      } else {
        await createResource(formData)
        toast.success("Recurso creado")
      }
      setIsAddDialogOpen(false)
      setEditingResource(null)
      setFormData({ title: "", description: "", url: "", category: categories[0]?.name || "" })
      loadData()
    } catch (error) {
      console.error("Error saving resource:", error)
      toast.error("Error al guardar recurso")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este recurso?")) return
    try {
      await deleteResource(id)
      toast.success("Recurso eliminado")
      loadData()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Error al eliminar recurso")
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      toast.error("El nombre de la categoría es requerido")
      return
    }
    try {
      await createResourceCategory({ name: newCategoryName.trim() })
      toast.success("Categoría creada")
      setNewCategoryName("")
      setIsAddCategoryDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Error al crear categoría")
    }
  }

  function openEditDialog(resource: Resource) {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description || "",
      url: resource.url,
      category: resource.category,
    })
    setIsAddDialogOpen(true)
  }

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === "all" || r.category === activeTab
    return matchesSearch && matchesCategory
  })

  const resourcesByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat.name] = filteredResources.filter((r) => r.category === cat.name)
      return acc
    },
    {} as Record<string, Resource[]>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Recursos
          </h1>
          <p className="text-muted-foreground">Base de conocimiento compartida del equipo</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Categoría</DialogTitle>
                <DialogDescription>Crea una nueva categoría para organizar recursos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre de la categoría</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ej: Tutoriales"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCategory}>Crear Categoría</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingResource(null)
                  setFormData({ title: "", description: "", url: "", category: categories[0]?.name || "" })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Recurso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingResource ? "Editar Recurso" : "Nuevo Recurso"}</DialogTitle>
                <DialogDescription>
                  {editingResource
                    ? "Modifica los datos del recurso"
                    : "Agrega un nuevo recurso a la base de conocimiento"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nombre del recurso"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción breve del recurso"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>{editingResource ? "Guardar Cambios" : "Crear Recurso"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar recursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos ({resources.length})</TabsTrigger>
          {categories.map((cat) => {
            const count = resources.filter((r) => r.category === cat.name).length
            return (
              <TabsTrigger key={cat.id} value={cat.name}>
                {cat.name} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const catResources = resourcesByCategory[cat.name] || []
              if (catResources.length === 0 && searchTerm) return null
              const IconComponent = iconMap[cat.icon || "FileText"] || FileText

              return (
                <Card key={cat.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconComponent className="h-5 w-5 text-primary" />
                      {cat.name}
                    </CardTitle>
                    {cat.description && <CardDescription>{cat.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {catResources.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin recursos en esta categoría</p>
                    ) : (
                      <ul className="space-y-2">
                        {catResources.map((resource) => (
                          <li key={resource.id} className="flex items-center justify-between group">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm hover:text-primary transition-colors flex-1 min-w-0"
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{resource.title}</span>
                            </a>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(resource.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.name} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = iconMap[cat.icon || "FileText"] || FileText
                    return <IconComponent className="h-5 w-5 text-primary" />
                  })()}
                  {cat.name}
                </CardTitle>
                {cat.description && <CardDescription>{cat.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {(resourcesByCategory[cat.name] || []).length === 0 ? (
                  <p className="text-muted-foreground">No hay recursos en esta categoría</p>
                ) : (
                  <div className="space-y-3">
                    {(resourcesByCategory[cat.name] || []).map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:text-primary flex items-center gap-2"
                          >
                            {resource.title}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(resource.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
