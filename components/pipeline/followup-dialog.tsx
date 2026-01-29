"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarClock } from "lucide-react"

export interface FollowUpData {
  type: string
  date: string
  description: string
}

interface FollowUpDialogProps {
  open: boolean
  dealName: string
  targetStage: string
  onConfirm: (data: FollowUpData) => void
  onCancel: () => void
}

const FOLLOWUP_TYPES = [
  { value: "enviar_propuesta", label: "Enviar propuesta" },
  { value: "confirmar_demo", label: "Confirmar demo" },
  { value: "llamada_seguimiento", label: "Llamada de seguimiento" },
  { value: "enviar_email", label: "Enviar email" },
  { value: "agendar_reunion", label: "Agendar reunión" },
  { value: "revisar_documentos", label: "Revisar documentos" },
  { value: "negociacion", label: "Negociación / Legal" },
  { value: "otro", label: "Otro" },
]

export function FollowUpDialog({
  open,
  dealName,
  targetStage,
  onConfirm,
  onCancel,
}: FollowUpDialogProps) {
  const [followUpType, setFollowUpType] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [description, setDescription] = useState("")

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case "primera_reunion_programada": return "1ª Reunión Programada"
      case "primera_reunion_realizada": return "1ª Reunión Realizada"
      case "demo_programada": return "Demo / Deep Dive"
      case "propuesta_enviada": return "Propuesta Enviada"
      case "negociacion": return "Negociación / Legal"
      default: return stage
    }
  }

  const handleConfirm = () => {
    if (followUpType && followUpDate) {
      const typeLabel = FOLLOWUP_TYPES.find(t => t.value === followUpType)?.label || followUpType
      onConfirm({
        type: followUpType,
        date: followUpDate,
        description: description || typeLabel
      })
      // Reset form
      setFollowUpType("")
      setFollowUpDate("")
      setDescription("")
    }
  }

  const handleCancel = () => {
    setFollowUpType("")
    setFollowUpDate("")
    setDescription("")
    onCancel()
  }

  // Fecha mínima: hoy
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Configurar Seguimiento
          </DialogTitle>
          <DialogDescription>
            Moviendo <span className="font-medium text-foreground">{dealName}</span> a{" "}
            <span className="font-medium text-foreground">{getStageLabel(targetStage)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="followup-type">¿Qué acción de seguimiento?</Label>
            <Select value={followUpType} onValueChange={setFollowUpType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de seguimiento" />
              </SelectTrigger>
              <SelectContent>
                {FOLLOWUP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup-date">¿Cuándo?</Label>
            <Input
              id="followup-date"
              type="datetime-local"
              min={today}
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Notas (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ej: Enviar propuesta desde correo ventas@myworkin.com, Confirmar demo para el martes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!followUpType || !followUpDate}
            className="bg-[#005691] hover:bg-[#004a7c]"
          >
            Confirmar y Mover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
