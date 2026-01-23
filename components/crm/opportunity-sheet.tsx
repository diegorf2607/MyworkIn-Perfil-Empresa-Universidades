"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Opportunity } from "@/lib/types"
import { Handshake, Plus, Calendar, DollarSign, Percent, Target } from "lucide-react"

interface OpportunitySheetProps {
  opportunity: Opportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const stageLabels = {
  discovery: "Discovery",
  demo: "Demo",
  propuesta: "Propuesta",
  negociacion: "Negociación",
  won: "Ganada",
  lost: "Perdida",
}

const stageColors = {
  discovery: "bg-blue-500/10 text-blue-500",
  demo: "bg-purple-500/10 text-purple-500",
  propuesta: "bg-amber-500/10 text-amber-500",
  negociacion: "bg-orange-500/10 text-orange-500",
  won: "bg-emerald-500/10 text-emerald-500",
  lost: "bg-red-500/10 text-red-500",
}

export function OpportunitySheet({ opportunity, open, onOpenChange }: OpportunitySheetProps) {
  const { updateOpportunity, deleteOpportunity, accounts, activities, addActivity, teamMembers } = useAppStore()

  const [editedOpp, setEditedOpp] = useState<Opportunity | null>(opportunity)
  const [newActivitySummary, setNewActivitySummary] = useState("")

  useEffect(() => {
    if (opportunity && editedOpp?.id !== opportunity.id) {
      setEditedOpp(opportunity)
    }
  }, [opportunity, editedOpp?.id])

  if (!editedOpp) return null

  const account = accounts.find((a) => a.id === editedOpp.accountId)
  const oppActivities = activities
    .filter((a) => a.accountId === editedOpp.accountId)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const handleSave = () => {
    if (!editedOpp) return
    updateOpportunity(editedOpp.id, editedOpp)
    toast.success("Oportunidad actualizada")
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteOpportunity(editedOpp.id)
    toast.success("Oportunidad eliminada")
    onOpenChange(false)
  }

  const handleAddActivity = () => {
    if (!newActivitySummary) return
    addActivity({
      id: Math.random().toString(36).substring(2, 11),
      countryCode: editedOpp.countryCode,
      accountId: editedOpp.accountId,
      type: "nota",
      dateTime: new Date().toISOString(),
      ownerId: teamMembers[0]?.id || "",
      summary: newActivitySummary,
    })
    setNewActivitySummary("")
    toast.success("Actividad registrada")
  }

  const handleCloseWon = () => {
    setEditedOpp({
      ...editedOpp,
      stage: "won",
      probability: 100,
      closedAt: new Date().toISOString(),
    })
  }

  const handleCloseLost = () => {
    setEditedOpp({
      ...editedOpp,
      stage: "lost",
      probability: 0,
      closedAt: new Date().toISOString(),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            {account?.name || "Oportunidad"}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Badge className={stageColors[editedOpp.stage]}>{stageLabels[editedOpp.stage]}</Badge>
            <span className="text-muted-foreground">•</span>
            <span>{editedOpp.product}</span>
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="detalles" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="cierre">Cierre</TabsTrigger>
          </TabsList>

          {/* Detalles Tab */}
          <TabsContent value="detalles" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Etapa
                </Label>
                <Select
                  value={editedOpp.stage}
                  onValueChange={(v) => setEditedOpp({ ...editedOpp, stage: v as Opportunity["stage"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="propuesta">Propuesta</SelectItem>
                    <SelectItem value="negociacion">Negociación</SelectItem>
                    <SelectItem value="won">Ganada</SelectItem>
                    <SelectItem value="lost">Perdida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  MRR
                </Label>
                <Input
                  type="number"
                  value={editedOpp.mrr}
                  onChange={(e) => setEditedOpp({ ...editedOpp, mrr: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5" />
                  Probabilidad
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editedOpp.probability}
                  onChange={(e) => setEditedOpp({ ...editedOpp, probability: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select value={editedOpp.product || ""} onValueChange={(v) => setEditedOpp({ ...editedOpp, product: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MyWorkIn (integral)">MyWorkIn (integral)</SelectItem>
                    <SelectItem value="MyWorkIn Lite">MyWorkIn Lite</SelectItem>
                    <SelectItem value="Bolsa de Trabajo">Bolsa de Trabajo</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Próximo paso</Label>
              <Input
                value={editedOpp.nextStep}
                onChange={(e) => setEditedOpp({ ...editedOpp, nextStep: e.target.value })}
                placeholder="Ej: Enviar propuesta comercial"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Fecha próximo paso
              </Label>
              <Input
                type="date"
                value={editedOpp.nextStepDate?.split("T")[0] || ""}
                onChange={(e) => setEditedOpp({ ...editedOpp, nextStepDate: e.target.value })}
              />
            </div>

            {/* Pipeline Value */}
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">Valor ponderado</p>
              <p className="text-2xl font-bold text-foreground">
                ${((editedOpp.mrr * editedOpp.probability) / 100).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ${editedOpp.mrr.toLocaleString()} MRR × {editedOpp.probability}%
              </p>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4 mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {oppActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 border-l-2 border-primary/20 pl-4 py-2">
                  <div className="flex-1">
                    <p className="text-sm">{activity.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.dateTime).toLocaleDateString("es-ES")} • {activity.type}
                    </p>
                  </div>
                </div>
              ))}
              {oppActivities.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No hay actividades registradas</p>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Registrar actividad..."
                value={newActivitySummary}
                onChange={(e) => setNewActivitySummary(e.target.value)}
              />
              <Button onClick={handleAddActivity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Cierre Tab */}
          <TabsContent value="cierre" className="space-y-4 mt-4">
            {editedOpp.stage === "won" || editedOpp.stage === "lost" ? (
              <div className="rounded-lg border border-border p-4 text-center">
                <Badge className={stageColors[editedOpp.stage]} variant="secondary">
                  {editedOpp.stage === "won" ? "Ganada" : "Perdida"}
                </Badge>
                {editedOpp.closedAt && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cerrada el {new Date(editedOpp.closedAt).toLocaleDateString("es-ES")}
                  </p>
                )}
                {editedOpp.lostReason && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Razón:</span> {editedOpp.lostReason}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Razón de pérdida (si aplica)</Label>
                  <Select
                    value={editedOpp.lostReason || ""}
                    onValueChange={(v) => setEditedOpp({ ...editedOpp, lostReason: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar razón" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presupuesto">Presupuesto</SelectItem>
                      <SelectItem value="Timing">Timing</SelectItem>
                      <SelectItem value="Competencia">Competencia</SelectItem>
                      <SelectItem value="No responde">No responde</SelectItem>
                      <SelectItem value="Cambio de prioridades">Cambio de prioridades</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="w-full bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                    onClick={handleCloseWon}
                  >
                    Cerrar como Ganada
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20"
                    onClick={handleCloseLost}
                  >
                    Cerrar como Perdida
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
