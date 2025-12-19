"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAccount } from "@/lib/actions/accounts"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface CreateAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryCode: string
  defaultStage: "lead" | "sql"
  onSuccess?: () => void
}

export function CreateAccountDialog({
  open,
  onOpenChange,
  countryCode,
  defaultStage,
  onSuccess,
}: CreateAccountDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    type: "privada" as "privada" | "pública",
    size: "mediana" as "pequeña" | "mediana" | "grande",
    website: "",
    fit_comercial: "medio" as "alto" | "medio" | "bajo",
    source: "outbound" as "inbound" | "outbound" | "referral" | "evento",
    notes: "",
  })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    startTransition(async () => {
      try {
        await createAccount({
          country_code: countryCode,
          name: formData.name,
          city: formData.city || null,
          type: formData.type,
          size: formData.size,
          website: formData.website || null,
          fit_comercial: formData.fit_comercial,
          stage: defaultStage,
          source: formData.source,
          notes: formData.notes || null,
          status: "activo",
          mrr: 0,
          probability: defaultStage === "sql" ? 20 : 10,
        })
        toast.success(`Universidad creada como ${defaultStage.toUpperCase()}`)
        onOpenChange(false)
        setFormData({
          name: "",
          city: "",
          type: "privada",
          size: "mediana",
          website: "",
          fit_comercial: "medio",
          source: "outbound",
          notes: "",
        })
        router.refresh()
        onSuccess?.()
      } catch (error: any) {
        if (error?.message === "DUPLICATE_NAME") {
          toast.error("Ya existe una universidad con ese nombre en este país")
        } else {
          toast.error("Error al crear universidad")
        }
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Universidad ({defaultStage === "lead" ? "Lead" : "SQL"})</DialogTitle>
          <DialogDescription>Agrega una nueva universidad al pipeline de {countryCode}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Universidad Nacional..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Lima, Ciudad de México..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as "privada" | "pública" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privada">Privada</SelectItem>
                  <SelectItem value="pública">Pública</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamaño</Label>
              <Select
                value={formData.size}
                onValueChange={(v) => setFormData({ ...formData, size: v as "pequeña" | "mediana" | "grande" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequeña">Pequeña</SelectItem>
                  <SelectItem value="mediana">Mediana</SelectItem>
                  <SelectItem value="grande">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select
                value={formData.source}
                onValueChange={(v) => setFormData({ ...formData, source: v as typeof formData.source })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fit Comercial</Label>
              <Select
                value={formData.fit_comercial}
                onValueChange={(v) => setFormData({ ...formData, fit_comercial: v as "alto" | "medio" | "bajo" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alto">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Alto
                    </span>
                  </SelectItem>
                  <SelectItem value="medio">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Medio
                    </span>
                  </SelectItem>
                  <SelectItem value="bajo">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Bajo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Crear"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
