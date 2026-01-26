"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sequence, SequenceStep } from "@/lib/types"
import { Mail, Linkedin, MessageCircle, Plus, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface SequencesPageProps {
  params: Promise<{ country: string }>
}

export default function SequencesPage() {
  const { country } = useParams<{ country: string }>()
  const { sequences, addSequence, updateSequence, deleteSequence } = useAppStore()

  const [activeTab, setActiveTab] = useState<"email" | "linkedin" | "whatsapp">("email")
  const [editingSequence, setEditingSequence] = useState<Sequence | null>(null)
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [newSequence, setNewSequence] = useState({ name: "", channel: "email" as const })

  const countrySequences = sequences.filter((s) => s.countryCode === country)
  const channelSequences = countrySequences.filter((s) => s.channel === activeTab)

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return Mail
      case "linkedin":
        return Linkedin
      case "whatsapp":
        return MessageCircle
      default:
        return Mail
    }
  }

  const handleCreateSequence = () => {
    if (!newSequence.name) {
      toast.error("Ingresa un nombre")
      return
    }
    addSequence({
      id: Math.random().toString(36).substring(2, 11),
      countryCode: country,
      channel: newSequence.channel,
      name: newSequence.name,
      steps: [],
    })
    setNewSequence({ name: "", channel: "email" })
    setIsNewDialogOpen(false)
    toast.success("Secuencia creada")
  }

  const handleDeleteSequence = (id: string) => {
    deleteSequence(id)
    toast.success("Secuencia eliminada")
  }

  const handleAddStep = (sequenceId: string) => {
    const sequence = sequences.find((s) => s.id === sequenceId)
    if (!sequence) return

    const newStep: SequenceStep = {
      id: Math.random().toString(36).substring(2, 11),
      order: sequence.steps.length + 1,
      content: "Nuevo paso...",
      delay: `Día ${sequence.steps.length + 1}`,
    }

    updateSequence(sequenceId, {
      steps: [...sequence.steps, newStep],
    })
    toast.success("Paso agregado")
  }

  const handleUpdateStep = (sequenceId: string, stepId: string, content: string) => {
    const sequence = sequences.find((s) => s.id === sequenceId)
    if (!sequence) return

    updateSequence(sequenceId, {
      steps: sequence.steps.map((s) => (s.id === stepId ? { ...s, content } : s)),
    })
  }

  const handleDeleteStep = (sequenceId: string, stepId: string) => {
    const sequence = sequences.find((s) => s.id === sequenceId)
    if (!sequence) return

    const newSteps = sequence.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, order: idx + 1, delay: `Día ${idx + 1}` }))

    updateSequence(sequenceId, { steps: newSteps })
    toast.success("Paso eliminado")
  }

  const handleMoveStep = (sequenceId: string, stepId: string, direction: "up" | "down") => {
    const sequence = sequences.find((s) => s.id === sequenceId)
    if (!sequence) return

    const stepIndex = sequence.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const newSteps = [...sequence.steps]
    const targetIndex = direction === "up" ? stepIndex - 1 : stepIndex + 1

    if (targetIndex < 0 || targetIndex >= newSteps.length) return
    ;[newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]]

    // Update order and delay
    const reorderedSteps = newSteps.map((s, idx) => ({
      ...s,
      order: idx + 1,
      delay: `Día ${idx + 1}`,
    }))

    updateSequence(sequenceId, { steps: reorderedSteps })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const ChannelIcon = getChannelIcon(activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Secuencias Outbound</h1>
          <p className="text-muted-foreground">Templates de mensajes para prospección</p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva secuencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear secuencia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newSequence.name}
                  onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
                  placeholder="Secuencia Discovery..."
                />
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={newSequence.channel}
                  onValueChange={(v) =>
                    setNewSequence({ ...newSequence, channel: v as "email" | "linkedin" | "whatsapp" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSequence}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="gap-2">
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {channelSequences.length === 0 ? (
            <Card className="p-8 text-center">
              <ChannelIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay secuencias de {activeTab}</p>
              <Button className="mt-4" onClick={() => setIsNewDialogOpen(true)}>
                Crear primera secuencia
              </Button>
            </Card>
          ) : (
            channelSequences.map((sequence) => (
              <Card key={sequence.id}>
                <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChannelIcon className="h-5 w-5" />
                      {sequence.name}
                    </CardTitle>
                    <CardDescription>{sequence.steps.length} pasos</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddStep(sequence.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Paso
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteSequence(sequence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-8 space-y-3">
                  {sequence.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {step.delay}
                        </Badge>
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={idx === 0}
                            onClick={() => handleMoveStep(sequence.id, step.id, "up")}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={idx === sequence.steps.length - 1}
                            onClick={() => handleMoveStep(sequence.id, step.id, "down")}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={step.content}
                          onChange={(e) => handleUpdateStep(sequence.id, step.id, e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(step.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteStep(sequence.id, step.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sequence.steps.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Sin pasos. Agrega el primer paso de la secuencia.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
