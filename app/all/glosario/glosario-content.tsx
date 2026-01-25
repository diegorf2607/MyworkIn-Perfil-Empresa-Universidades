"use client"

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Search, MoreVertical, Pencil, Trash2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from "@/lib/actions/glossary"

type GlossaryTerm = {
  id: string
  term: string
  definition: string
  category: string | null
  created_at: string
}

export default function GlosarioContent() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null)

  const [formData, setFormData] = useState({
    term: "",
    definition: "",
    category: "",
  })

  useEffect(() => {
    loadTerms()
  }, [])

  async function loadTerms() {
    try {
      const data = await getGlossaryTerms()
      setTerms(data)
    } catch (error) {
      console.error("Error loading terms:", error)
      toast.error("Error al cargar glosario")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!formData.term || !formData.definition) {
      toast.error("Por favor completa los campos requeridos")
      return
    }
    try {
      if (editingTerm) {
        await updateGlossaryTerm({ id: editingTerm.id, ...formData })
        toast.success("Término actualizado")
      } else {
        await createGlossaryTerm(formData)
        toast.success("Término creado")
      }
      setIsAddDialogOpen(false)
      setEditingTerm(null)
      setFormData({ term: "", definition: "", category: "" })
      loadTerms()
    } catch (error) {
      console.error("Error saving term:", error)
      toast.error("Error al guardar término")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este término?")) return
    try {
      await deleteGlossaryTerm(id)
      toast.success("Término eliminado")
      loadTerms()
    } catch (error) {
      console.error("Error deleting term:", error)
      toast.error("Error al eliminar término")
    }
  }

  function openEditDialog(term: GlossaryTerm) {
    setEditingTerm(term)
    setFormData({
      term: term.term,
      definition: term.definition,
      category: term.category || "",
    })
    setIsAddDialogOpen(true)
  }

  const filteredTerms = terms.filter(
    (t) =>
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const groupedTerms = filteredTerms.reduce(
    (acc, term) => {
      const letter = term.term[0].toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(term)
      return acc
    },
    {} as Record<string, GlossaryTerm[]>,
  )

  const sortedLetters = Object.keys(groupedTerms).sort()

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
            <BookOpen className="h-6 w-6 text-primary" />
            Glosario
          </h1>
          <p className="text-muted-foreground">Definiciones y términos del negocio</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTerm(null)
                setFormData({ term: "", definition: "", category: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Término
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTerm ? "Editar Término" : "Nuevo Término"}</DialogTitle>
              <DialogDescription>
                {editingTerm ? "Modifica la definición del término" : "Agrega un nuevo término al glosario"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Término *</Label>
                <Input
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  placeholder="Ej: SQL"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría (opcional)</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Ventas, CRM, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Definición *</Label>
                <Textarea
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="Explicación clara del término..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>{editingTerm ? "Guardar Cambios" : "Crear Término"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar términos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{terms.length} términos en total</span>
        {searchTerm && <span>• {filteredTerms.length} resultados</span>}
      </div>

      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Términos</CardTitle>
          <CardDescription>Haz clic en un término para ver su definición</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          {filteredTerms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "No se encontraron términos" : "No hay términos en el glosario"}
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {sortedLetters.map((letter) => (
                <div key={letter} className="mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-2">{letter}</h3>
                  {groupedTerms[letter]
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term) => (
                      <AccordionItem key={term.id} value={term.id} className="border rounded-lg mb-2 px-4">
                        <div className="flex items-center justify-between">
                          <AccordionTrigger className="flex-1 hover:no-underline">
                            <span className="font-medium">{term.term}</span>
                          </AccordionTrigger>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(term)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(term.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {term.definition}
                          {term.category && (
                            <span className="inline-block mt-2 text-xs bg-secondary px-2 py-1 rounded">
                              {term.category}
                            </span>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </div>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
