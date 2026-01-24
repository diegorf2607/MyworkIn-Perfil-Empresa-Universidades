"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { AlertCircle } from "lucide-react"
import { LOST_REASONS } from "@/lib/mock-data/deals"

interface LostReasonDialogProps {
  open: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function LostReasonDialog({
  open,
  onConfirm,
  onCancel,
}: LostReasonDialogProps) {
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  const handleConfirm = () => {
    const reason = selectedReason === "Otro" ? customReason : selectedReason
    if (reason.trim()) {
      onConfirm(reason)
      setSelectedReason("")
      setCustomReason("")
    }
  }

  const handleCancel = () => {
    setSelectedReason("")
    setCustomReason("")
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Marcar como Perdida
          </DialogTitle>
          <DialogDescription>
            Por favor selecciona el motivo por el cual se perdió esta oportunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de pérdida</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {LOST_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "Otro" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Describe el motivo</Label>
              <Textarea
                id="custom-reason"
                placeholder="Escribe el motivo específico..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === "Otro" && !customReason.trim())}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
