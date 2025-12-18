"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  Building2,
  Plus,
  Trash2,
  Mail,
  Phone,
  Loader2,
  Calendar,
  Clock,
  Pencil,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { updateAccount, deleteAccount, updateFollowUp } from "@/lib/actions/accounts"
import { createContact, updateContact, deleteContact } from "@/lib/actions/contacts"
import { deleteOpportunity } from "@/lib/actions/opportunities"
import { createActivity, updateActivity, deleteActivity } from "@/lib/actions/activities"
import { createMeeting } from "@/lib/actions/meetings"

type Account = {
  id: string
  name: string
  city?: string
  type?: string
  size?: string
  stage: string
  icp_fit?: number
  mrr?: number
  probability?: number
  website?: string
  notes?: string
  country_code: string
  owner_id?: string
  first_contact_at?: string
  last_contact_at?: string
  next_follow_up_at?: string
  next_follow_up_label?: string
  contacts?: Contact[]
  opportunities?: Opportunity[]
  activities?: Activity[]
  meetings?: Meeting[]
}

type Contact = {
  id: string
  account_id: string
  name: string
  role?: string
  title?: string
  email?: string
  whatsapp?: string
}

type Opportunity = {
  id: string
  account_id: string
  stage: string
  mrr?: number
  probability?: number
  product?: string
  next_step?: string
  lost_reason?: string
}

type Activity = {
  id: string
  account_id: string
  type: string
  date_time: string
  summary?: string
  subject?: string
  owner_id?: string
  requires_follow_up?: boolean
}

type Meeting = {
  id: string
  account_id: string
  date_time: string
  kind?: string
  notes?: string
  outcome?: string
  next_step?: string
  next_meeting_date?: string
}

interface EntitySheetProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

export function EntitySheet({ account, open, onOpenChange, onRefresh }: EntitySheetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editedAccount, setEditedAccount] = useState<Account | null>(account)
  const [newContactName, setNewContactName] = useState("")
  const [newActivitySummary, setNewActivitySummary] = useState("")

  // Dialog states
  const [historyFilter, setHistoryFilter] = useState<string>("all")
  const [historySort, setHistorySort] = useState<"recent" | "oldest">("recent")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false)

  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    title: "",
    role: "KDM" as "KDM" | "influencer" | "procurement",
    email: "",
    whatsapp: "",
  })

  const [emailForm, setEmailForm] = useState({
    dateTime: new Date().toISOString().slice(0, 16),
    subject: "",
    summary: "",
    result: "enviado" as "enviado" | "respondido" | "sin_respuesta" | "rebotado",
    requiresFollowUp: false,
    followUpDate: "",
  })

  // Meeting form state
  const [meetingForm, setMeetingForm] = useState({
    dateTime: "",
    kind: "Discovery",
    notes: "",
    nextStep: "",
    nextMeetingDate: "",
  })

  const [followUpForm, setFollowUpForm] = useState({
    firstContactAt: "",
    lastContactAt: "",
    nextFollowUpAt: "",
    nextFollowUpLabel: "",
    status: "auto" as "auto" | "al_dia" | "pendiente" | "vencido" | "sin_definir",
  })

  // Sync when account changes
  useEffect(() => {
    if (account) {
      setEditedAccount(account)
    }
  }, [account])

  if (!editedAccount) return null

  const accountContacts = editedAccount.contacts || []
  const accountActivities = editedAccount.activities || []
  const accountMeetings = editedAccount.meetings || []
  const accountOpportunities = editedAccount.opportunities || []

  const allHistory = [
    ...accountActivities.map((a) => ({
      ...a,
      historyType: "activity" as const,
      sortDate: a.date_time || a.id,
    })),
    ...accountMeetings.map((m) => ({
      ...m,
      historyType: "meeting" as const,
      type: "reunión" as const,
      summary: `${m.kind || "Reunión"}: ${m.notes || "Sin notas"}`,
      sortDate: m.date_time || m.id,
    })),
  ]
    .filter((item) => historyFilter === "all" || item.type === historyFilter)
    .sort((a, b) => {
      const dateA = new Date(a.sortDate).getTime() || 0
      const dateB = new Date(b.sortDate).getTime() || 0
      return historySort === "recent" ? dateB - dateA : dateA - dateB
    })

  // Follow-up status calculation
  const getFollowUpStatus = () => {
    if (!editedAccount.next_follow_up_at) {
      return { label: "Sin definir", color: "bg-gray-100 text-gray-700", icon: AlertCircle }
    }
    const now = new Date()
    const followUpDate = new Date(editedAccount.next_follow_up_at)
    const diffDays = Math.ceil((followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: "Vencido", color: "bg-red-100 text-red-700", icon: XCircle }
    } else if (diffDays <= 3) {
      return { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: Clock }
    } else {
      return { label: "Al día", color: "bg-green-100 text-green-700", icon: CheckCircle2 }
    }
  }

  const followUpStatus = getFollowUpStatus()
  const FollowUpIcon = followUpStatus.icon

  const formatDate = (date?: string) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (date?: string) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })
  }

  // Save account changes
  const handleSaveAccount = () => {
    startTransition(async () => {
      try {
        await updateAccount({
          id: editedAccount.id,
          name: editedAccount.name,
          city: editedAccount.city,
          type: editedAccount.type,
          size: editedAccount.size,
          stage: editedAccount.stage,
          icp_fit: editedAccount.icp_fit,
          mrr: editedAccount.mrr,
          probability: editedAccount.probability,
          website: editedAccount.website,
          notes: editedAccount.notes,
        })
        toast.success("Guardado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al guardar")
        console.error(error)
      }
    })
  }

  // Delete account
  const handleDeleteAccount = () => {
    if (!confirm("¿Eliminar esta universidad y todos sus datos?")) return
    startTransition(async () => {
      try {
        await deleteAccount(editedAccount.id)
        toast.success("Eliminado")
        onOpenChange(false)
        onRefresh?.()
      } catch (error) {
        toast.error("Error al eliminar")
        console.error(error)
      }
    })
  }

  // Add quick note
  const handleAddQuickNote = () => {
    if (!newActivitySummary.trim()) return
    startTransition(async () => {
      try {
        await createActivity({
          country_code: editedAccount.country_code,
          account_id: editedAccount.id,
          type: "nota",
          summary: newActivitySummary,
          date_time: new Date().toISOString(),
        })
        setNewActivitySummary("")
        toast.success("Nota agregada")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al agregar nota")
        console.error(error)
      }
    })
  }

  const handleRegisterEmail = () => {
    if (!emailForm.subject.trim()) {
      toast.error("El asunto es requerido")
      return
    }
    startTransition(async () => {
      try {
        const resultLabels: Record<string, string> = {
          enviado: "Enviado",
          respondido: "Respondido",
          sin_respuesta: "Sin respuesta",
          rebotado: "Rebotado",
        }

        // Create activity with full details
        await createActivity({
          country_code: editedAccount.country_code,
          account_id: editedAccount.id,
          type: "email",
          date_time: emailForm.dateTime || new Date().toISOString(),
          subject: emailForm.subject,
          summary: `Email: ${emailForm.subject} — ${resultLabels[emailForm.result]}${emailForm.summary ? `. ${emailForm.summary}` : ""}`,
          requires_follow_up: emailForm.requiresFollowUp,
        })

        // Update follow-up if required
        if (emailForm.requiresFollowUp && emailForm.followUpDate) {
          await updateFollowUp(editedAccount.id, emailForm.followUpDate, "Seguimiento email")
        }

        // Reset form and close
        setEmailForm({
          dateTime: new Date().toISOString().slice(0, 16),
          subject: "",
          summary: "",
          result: "enviado",
          requiresFollowUp: false,
          followUpDate: "",
        })
        setEmailDialogOpen(false)
        toast.success("Email registrado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al registrar email")
        console.error(error)
      }
    })
  }

  // Schedule meeting
  const handleScheduleMeeting = () => {
    if (!meetingForm.dateTime) {
      toast.error("La fecha es requerida")
      return
    }
    startTransition(async () => {
      try {
        await createMeeting({
          country_code: editedAccount.country_code,
          account_id: editedAccount.id,
          date_time: meetingForm.dateTime,
          kind: meetingForm.kind,
          notes: meetingForm.notes,
          next_step: meetingForm.nextStep,
          next_meeting_date: meetingForm.nextMeetingDate || undefined,
        })

        // Also create an activity so it appears in history
        await createActivity({
          country_code: editedAccount.country_code,
          account_id: editedAccount.id,
          type: "reunión",
          date_time: meetingForm.dateTime,
          summary: `${meetingForm.kind}: ${meetingForm.notes || "Reunión agendada"}`,
        })

        // Update follow-up if next meeting date set
        if (meetingForm.nextMeetingDate) {
          await updateFollowUp(editedAccount.id, meetingForm.nextMeetingDate, `Próxima reunión: ${meetingForm.kind}`)
        }

        setMeetingForm({ dateTime: "", kind: "Discovery", notes: "", nextStep: "", nextMeetingDate: "" })
        setMeetingDialogOpen(false)
        toast.success("Reunión agendada")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al agendar reunión")
        console.error(error)
      }
    })
  }

  const handleSaveFollowUp = () => {
    startTransition(async () => {
      try {
        const updates: Record<string, string | null> = {}

        if (followUpForm.firstContactAt) {
          updates.first_contact_at = new Date(followUpForm.firstContactAt).toISOString()
        }
        if (followUpForm.lastContactAt) {
          updates.last_contact_at = new Date(followUpForm.lastContactAt).toISOString()
        }
        if (followUpForm.nextFollowUpAt) {
          updates.next_follow_up_at = new Date(followUpForm.nextFollowUpAt).toISOString()
        } else {
          updates.next_follow_up_at = null
        }
        updates.next_follow_up_label = followUpForm.nextFollowUpLabel || null

        await updateAccount({
          id: editedAccount.id,
          ...updates,
        })

        setFollowUpDialogOpen(false)
        toast.success("Seguimiento actualizado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al actualizar seguimiento")
        console.error(error)
      }
    })
  }

  // Edit activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setEditActivityDialogOpen(true)
  }

  const handleSaveActivityEdit = () => {
    if (!editingActivity) return
    startTransition(async () => {
      try {
        await updateActivity({
          id: editingActivity.id,
          summary: editingActivity.summary,
          subject: editingActivity.subject,
        })
        setEditActivityDialogOpen(false)
        setEditingActivity(null)
        toast.success("Actividad actualizada")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al actualizar")
        console.error(error)
      }
    })
  }

  // Delete activity
  const handleDeleteActivity = (activityId: string) => {
    if (!confirm("¿Eliminar esta actividad?")) return
    startTransition(async () => {
      try {
        await deleteActivity(activityId)
        toast.success("Actividad eliminada")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al eliminar")
        console.error(error)
      }
    })
  }

  // Contact handlers
  const handleOpenContactDialog = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact)
      setContactForm({
        name: contact.name,
        title: contact.title || "",
        role: (contact.role as "KDM" | "influencer" | "procurement") || "KDM",
        email: contact.email || "",
        whatsapp: contact.whatsapp || "",
      })
    } else {
      setEditingContact(null)
      setContactForm({ name: "", title: "", role: "KDM", email: "", whatsapp: "" })
    }
    setContactDialogOpen(true)
  }

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    startTransition(async () => {
      try {
        if (editingContact) {
          await updateContact({
            id: editingContact.id,
            name: contactForm.name,
            title: contactForm.title,
            role: contactForm.role,
            email: contactForm.email,
            whatsapp: contactForm.whatsapp,
          })
        } else {
          await createContact({
            account_id: editedAccount.id,
            name: contactForm.name,
            title: contactForm.title,
            role: contactForm.role,
            email: contactForm.email,
            whatsapp: contactForm.whatsapp,
          })
        }
        setContactDialogOpen(false)
        toast.success(editingContact ? "Contacto actualizado" : "Contacto creado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al guardar contacto")
        console.error(error)
      }
    })
  }

  const handleDeleteContact = (contactId: string) => {
    if (!confirm("¿Eliminar este contacto?")) return
    startTransition(async () => {
      try {
        await deleteContact(contactId)
        toast.success("Contacto eliminado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al eliminar")
        console.error(error)
      }
    })
  }

  const handleAddQuickContact = () => {
    if (!newContactName.trim()) return
    startTransition(async () => {
      try {
        await createContact({
          account_id: editedAccount.id,
          name: newContactName,
        })
        setNewContactName("")
        toast.success("Contacto agregado")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al agregar contacto")
        console.error(error)
      }
    })
  }

  // Opportunity handlers
  const handleDeleteOpportunity = (oppId: string) => {
    if (!confirm("¿Eliminar esta oportunidad?")) return
    startTransition(async () => {
      try {
        await deleteOpportunity(oppId)
        toast.success("Oportunidad eliminada")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al eliminar")
        console.error(error)
      }
    })
  }

  const typeIcons: Record<string, typeof Mail> = {
    email: Mail,
    llamada: Phone,
    reunión: Calendar,
    nota: MessageSquare,
    linkedin: MessageSquare,
    whatsapp: Phone,
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="p-6">
            <SheetHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <SheetTitle className="text-lg">{editedAccount.name}</SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {editedAccount.city} • {editedAccount.type}
                  </p>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="perfil" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="contactos">Contactos</TabsTrigger>
                <TabsTrigger value="opps">Opps</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>

              {/* Perfil Tab */}
              <TabsContent value="perfil" className="space-y-5 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={editedAccount.name}
                      onChange={(e) => setEditedAccount({ ...editedAccount, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      value={editedAccount.city || ""}
                      onChange={(e) => setEditedAccount({ ...editedAccount, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={editedAccount.type || "privada"}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="privada">Privada</SelectItem>
                        <SelectItem value="publica">Pública</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tamaño</Label>
                    <Select
                      value={editedAccount.size || "mediana"}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, size: v })}
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
                  <div className="space-y-2">
                    <Label>ICP Fit</Label>
                    <Input
                      type="number"
                      value={editedAccount.icp_fit || ""}
                      onChange={(e) =>
                        setEditedAccount({ ...editedAccount, icp_fit: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Etapa</Label>
                    <Select
                      value={editedAccount.stage}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, stage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="opp">Opp</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>MRR Estimado</Label>
                    <Input
                      type="number"
                      value={editedAccount.mrr || ""}
                      onChange={(e) =>
                        setEditedAccount({ ...editedAccount, mrr: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Probabilidad %</Label>
                    <Input
                      type="number"
                      value={editedAccount.probability || ""}
                      onChange={(e) =>
                        setEditedAccount({ ...editedAccount, probability: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={editedAccount.website || ""}
                    onChange={(e) => setEditedAccount({ ...editedAccount, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={editedAccount.notes || ""}
                    onChange={(e) => setEditedAccount({ ...editedAccount, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button onClick={handleSaveAccount} disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Guardar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isPending} className="w-full">
                    Eliminar
                  </Button>
                </div>
              </TabsContent>

              {/* Contactos Tab */}
              <TabsContent value="contactos" className="space-y-4 mt-6">
                {accountContacts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay contactos</p>
                ) : (
                  <div className="space-y-3">
                    {accountContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{contact.name}</p>
                            {contact.role && (
                              <Badge variant="secondary" className="text-xs">
                                {contact.role}
                              </Badge>
                            )}
                          </div>
                          {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                          <div className="flex gap-3 mt-1">
                            {contact.email && (
                              <a href={`mailto:${contact.email}`} className="text-xs text-primary hover:underline">
                                {contact.email}
                              </a>
                            )}
                            {contact.whatsapp && (
                              <a
                                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:underline"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenContactDialog(contact)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre del contacto"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddQuickContact()}
                  />
                  <Button onClick={handleAddQuickContact} disabled={isPending} size="icon">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => handleOpenContactDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar contacto completo
                </Button>
              </TabsContent>

              {/* Opps Tab */}
              <TabsContent value="opps" className="space-y-4 mt-6">
                {accountOpportunities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay oportunidades</p>
                ) : (
                  <div className="space-y-3">
                    {accountOpportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                opp.stage === "won"
                                  ? "bg-green-100 text-green-700"
                                  : opp.stage === "lost"
                                    ? "bg-red-100 text-red-700"
                                    : ""
                              }
                            >
                              {opp.stage}
                            </Badge>
                            <span className="font-medium">${opp.mrr?.toLocaleString() || 0}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{opp.product || "Sin producto"}</p>
                          {opp.next_step && <p className="text-xs text-muted-foreground mt-1">→ {opp.next_step}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteOpportunity(opp.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Histórico Tab */}
              <TabsContent value="historico" className="space-y-4 mt-6">
                {/* Metrics bar */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Primer contacto</p>
                    <p className="text-sm font-medium">{formatDate(editedAccount.first_contact_at)}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Último contacto</p>
                    <p className="text-sm font-medium">{formatDate(editedAccount.last_contact_at)}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Próximo seguimiento</p>
                    <p className="text-sm font-medium">{formatDate(editedAccount.next_follow_up_at)}</p>
                    {editedAccount.next_follow_up_label && (
                      <p className="text-xs text-muted-foreground">{editedAccount.next_follow_up_label}</p>
                    )}
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FollowUpIcon className="h-3.5 w-3.5" />
                      <Badge className={followUpStatus.color} variant="secondary">
                        {followUpStatus.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setFollowUpForm({
                      firstContactAt: editedAccount.first_contact_at?.slice(0, 16) || "",
                      lastContactAt: editedAccount.last_contact_at?.slice(0, 16) || "",
                      nextFollowUpAt: editedAccount.next_follow_up_at?.slice(0, 16) || "",
                      nextFollowUpLabel: editedAccount.next_follow_up_label || "",
                      status: "auto",
                    })
                    setFollowUpDialogOpen(true)
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar seguimiento
                </Button>

                {/* Quick input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Registrar nota rápida..."
                    value={newActivitySummary}
                    onChange={(e) => setNewActivitySummary(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddQuickNote()}
                  />
                  <Button onClick={handleAddQuickNote} disabled={isPending} size="icon">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Quick action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setEmailForm({
                        dateTime: new Date().toISOString().slice(0, 16),
                        subject: "",
                        summary: "",
                        result: "enviado",
                        requiresFollowUp: false,
                        followUpDate: "",
                      })
                      setEmailDialogOpen(true)
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Registrar email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setMeetingForm({
                        dateTime: "",
                        kind: "Discovery",
                        notes: "",
                        nextStep: "",
                        nextMeetingDate: "",
                      })
                      setMeetingDialogOpen(true)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar reunión
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 items-center">
                  <Select value={historyFilter} onValueChange={setHistoryFilter}>
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="reunión">Reunión</SelectItem>
                      <SelectItem value="llamada">Llamada</SelectItem>
                      <SelectItem value="nota">Nota</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={historySort} onValueChange={(v) => setHistorySort(v as "recent" | "oldest")}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Más reciente</SelectItem>
                      <SelectItem value="oldest">Más antiguo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeline list */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {allHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No hay actividades registradas</p>
                  ) : (
                    allHistory.map((item) => {
                      const Icon = typeIcons[item.type] || MessageSquare
                      return (
                        <div key={item.id} className="flex gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDateShort(item.date_time)}</span>
                            </div>
                            <p className="text-sm mt-1 break-words">{item.summary || "Sin descripción"}</p>
                          </div>
                          {item.historyType === "activity" && (
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditActivity(item as Activity)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDeleteActivity(item.id)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha y hora</Label>
              <Input
                type="datetime-local"
                value={emailForm.dateTime}
                onChange={(e) => setEmailForm({ ...emailForm, dateTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Asunto *</Label>
              <Input
                placeholder="Asunto del email..."
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Resumen / Nota</Label>
              <Textarea
                placeholder="Resumen del contenido..."
                value={emailForm.summary}
                onChange={(e) => setEmailForm({ ...emailForm, summary: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado</Label>
              <Select
                value={emailForm.result}
                onValueChange={(v) => setEmailForm({ ...emailForm, result: v as typeof emailForm.result })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="respondido">Respondido</SelectItem>
                  <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
                  <SelectItem value="rebotado">Rebotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Requiere seguimiento</Label>
              <Switch
                checked={emailForm.requiresFollowUp}
                onCheckedChange={(v) => setEmailForm({ ...emailForm, requiresFollowUp: v })}
              />
            </div>
            {emailForm.requiresFollowUp && (
              <div className="space-y-2">
                <Label>Fecha de seguimiento</Label>
                <Input
                  type="datetime-local"
                  value={emailForm.followUpDate}
                  onChange={(e) => setEmailForm({ ...emailForm, followUpDate: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterEmail} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Reunión</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha y hora *</Label>
              <Input
                type="datetime-local"
                value={meetingForm.dateTime}
                onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={meetingForm.kind} onValueChange={(v) => setMeetingForm({ ...meetingForm, kind: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discovery">Discovery</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Propuesta">Propuesta</SelectItem>
                  <SelectItem value="Negociación">Negociación</SelectItem>
                  <SelectItem value="Cierre">Cierre</SelectItem>
                  <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Notas de la reunión..."
                value={meetingForm.notes}
                onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Próximo paso</Label>
              <Input
                placeholder="¿Qué sigue después?"
                value={meetingForm.nextStep}
                onChange={(e) => setMeetingForm({ ...meetingForm, nextStep: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Próxima reunión (opcional)</Label>
              <Input
                type="date"
                value={meetingForm.nextMeetingDate}
                onChange={(e) => setMeetingForm({ ...meetingForm, nextMeetingDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleMeeting} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Seguimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primer contacto</Label>
              <Input
                type="datetime-local"
                value={followUpForm.firstContactAt}
                onChange={(e) => setFollowUpForm({ ...followUpForm, firstContactAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Último contacto</Label>
              <Input
                type="datetime-local"
                value={followUpForm.lastContactAt}
                onChange={(e) => setFollowUpForm({ ...followUpForm, lastContactAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Próximo seguimiento</Label>
              <Input
                type="datetime-local"
                value={followUpForm.nextFollowUpAt}
                onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo del seguimiento</Label>
              <Input
                placeholder="Ej: Seguimiento propuesta, Demo, etc."
                value={followUpForm.nextFollowUpLabel}
                onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpLabel: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFollowUp} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityDialogOpen} onOpenChange={setEditActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Actividad</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <div className="space-y-4">
              {editingActivity.subject !== undefined && (
                <div className="space-y-2">
                  <Label>Asunto</Label>
                  <Input
                    value={editingActivity.subject || ""}
                    onChange={(e) => setEditingActivity({ ...editingActivity, subject: e.target.value })}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Resumen</Label>
                <Textarea
                  value={editingActivity.summary || ""}
                  onChange={(e) => setEditingActivity({ ...editingActivity, summary: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditActivityDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveActivityEdit} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo / Título</Label>
              <Input
                value={contactForm.title}
                onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                placeholder="Ej: Director de TI"
              />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={contactForm.role}
                onValueChange={(v) => setContactForm({ ...contactForm, role: v as typeof contactForm.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KDM">KDM (Key Decision Maker)</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="correo@universidad.edu"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={contactForm.whatsapp}
                onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
