"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react"
import { toast } from "sonner"

interface GlossaryPageProps {
  params: Promise<{ country: string }>
}

export default function GlossaryPage() {
  const { country } = useParams<{ country: string }>()
  const { glossaryTerms, addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } = useAppStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<(typeof glossaryTerms)[0] | null>(null)
  const [newTerm, setNewTerm] = useState({ term: "", definition: "", category: "Ventas" })

  const filteredTerms = useMemo(() => {
    if (!searchQuery) return glossaryTerms
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.definition.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [glossaryTerms, searchQuery])

  const groupedTerms = useMemo(() => {
    const grouped: Record<string, typeof glossaryTerms> = {}
    for (const term of filteredTerms) {
      if (!grouped[term.category]) {
        grouped[term.category] = []
      }
      grouped[term.category].push(term)
    }
    return grouped
  }, [filteredTerms])

  const handleCreateTerm = () => {
    if (!newTerm.term || !newTerm.definition) {
      toast.error("Completa todos los campos")
      return
    }
    addGlossaryTerm({
      id: Math.random().toString(36).substring(2, 11),
      term: newTerm.term,
      definition: newTerm.definition,
      category: newTerm.category,
    })
    setNewTerm({ term: "", definition: "", category: "Ventas" })
    setIsNewDialogOpen(false)
    toast.success("Término agregado")
  }

  const handleUpdateTerm = () => {
    if (!editingTerm) return
    updateGlossaryTerm(editingTerm.id, editingTerm)
    setEditingTerm(null)
    toast.success("Término actualizado")
  }

  const handleDeleteTerm = (id: string) => {
    deleteGlossaryTerm(id)
    toast.success("Término eliminado")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Glosario Comercial</h1>
          <p className="text-muted-foreground">Términos y definiciones del equipo de ventas</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar término
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo término</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Término</Label>
                <Input
                  value={newTerm.term}
                  onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                  placeholder="ICP, MRR, SQL..."
                />
              </div>
              <div className="space-y-2">
                <Label>Definición</Label>
                <Textarea
                  value={newTerm.definition}
                  onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                  placeholder="Explicación del término..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input
                  value={newTerm.category}
                  onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
                  placeholder="Ventas, Métricas, Proceso..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTerm}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar término..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Terms by Category */}
      {Object.keys(groupedTerms).length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay términos en el glosario</p>
          <Button className="mt-4" onClick={() => setIsNewDialogOpen(true)}>
            Agregar primer término
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTerms)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, terms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base">{category}</CardTitle>
                  <CardDescription>{terms.length} términos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {terms
                    .sort((a, b) => a.term.localeCompare(b.term))
                    .map((term) => (
                      <div
                        key={term.id}
                        className="group flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-semibold text-primary">{term.term}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{term.definition}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTerm(term)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteTerm(term.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTerm} onOpenChange={(open) => !open && setEditingTerm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar término</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Término</Label>
              <Input
                value={editingTerm?.term || ""}
                onChange={(e) => setEditingTerm((prev) => (prev ? { ...prev, term: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <Label>Definición</Label>
              <Textarea
                value={editingTerm?.definition || ""}
                onChange={(e) => setEditingTerm((prev) => (prev ? { ...prev, definition: e.target.value } : null))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={editingTerm?.category || ""}
                onChange={(e) => setEditingTerm((prev) => (prev ? { ...prev, category: e.target.value } : null))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTerm(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTerm}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
