"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
  Loader2,
  Pencil,
  MessageSquare,
  Video,
  RefreshCw,
  Clock,
  Star,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { updateAccount, deleteAccount } from "@/lib/actions/accounts"
import { createContact, updateContact, deleteContact, getContactsByAccount } from "@/lib/actions/contacts"
import { getOpportunitiesByAccount } from "@/lib/actions/opportunities"
import { createActivity, getActivitiesByAccount, deleteActivity } from "@/lib/actions/activities"
import { createMeeting, getMeetingsByAccount, deleteMeeting } from "@/lib/actions/meetings"

// Types from database
type Contact = Awaited<ReturnType<typeof getContactsByAccount>>[0]
type Opportunity = Awaited<ReturnType<typeof getOpportunitiesByAccount>>[0]
type Activity = Awaited<ReturnType<typeof getActivitiesByAccount>>[0]
type Meeting = Awaited<ReturnType<typeof getMeetingsByAccount>>[0]
import {
  getKDMContactsByAccount,
  linkKDMToAccount,
  unlinkKDMFromAccount,
  getKDMContacts,
  createKDMContact,
  type KDMContact,
} from "@/lib/actions/kdm"

interface Account {
  id: string
  name: string
  city?: string
  type?: string
  size?: string
  stage: string
  icp_fit?: number
  fit_comercial?: string
  mrr?: number
  probability?: number
  website?: string
  notes?: string
  country_code: string
  first_contact_at?: string
  last_contact_at?: string
  next_follow_up_at?: string
  next_follow_up_label?: string
  activities?: Activity[]
  meetings?: Meeting[]
}

interface EntitySheetProps {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh?: () => void
}

const fitComercialColors: Record<string, string> = {
  alto: "bg-green-100 text-green-800 border-green-300",
  medio: "bg-yellow-100 text-yellow-800 border-yellow-300",
  bajo: "bg-red-100 text-red-800 border-red-300",
}

export function EntitySheet({ account, open, onOpenChange, onRefresh }: EntitySheetProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("perfil")
  const [editedAccount, setEditedAccount] = useState<Account | null>(null)

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    title: "",
    role: "" as "" | "KDM" | "influencer" | "procurement",
    email: "",
    whatsapp: "",
  })

  const [kdmContacts, setKdmContacts] = useState<(KDMContact & { is_primary?: boolean })[]>([])
  const [allKdmContacts, setAllKdmContacts] = useState<KDMContact[]>([])
  const [kdmDialogOpen, setKdmDialogOpen] = useState(false)
  const [newKdmDialogOpen, setNewKdmDialogOpen] = useState(false)
  const [newKdmForm, setNewKdmForm] = useState({
    first_name: "",
    last_name: "",
    role_title: "",
    email: "",
    phone: "",
  })

  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])

  // Histórico state
  const [historicoData, setHistoricoData] = useState<{ activities: Activity[]; meetings: Meeting[] }>({
    activities: [],
    meetings: [],
  })
  const [historicoFilter, setHistoricoFilter] = useState<"all" | "email" | "meeting" | "note" | "call">("all")
  const [newActivitySummary, setNewActivitySummary] = useState("")

  // Email dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailForm, setEmailForm] = useState({
    dateTime: "",
    subject: "",
    summary: "",
    result: "enviado" as "enviado" | "respondido" | "sin_respuesta" | "rebotado",
    requiresFollowUp: false,
    followUpDate: "",
  })

  // Meeting dialog
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [meetingForm, setMeetingForm] = useState({
    dateTime: "",
    kind: "Discovery" as "Discovery" | "Demo" | "Propuesta" | "Kickoff",
    notes: "",
  })

  // Follow-up dialog
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [followUpForm, setFollowUpForm] = useState({
    firstContactAt: "",
    lastContactAt: "",
    nextFollowUpAt: "",
    nextFollowUpLabel: "",
  })

  const [fitComercialDialogOpen, setFitComercialDialogOpen] = useState(false)

  // Load contacts, opps, and KDM
  const loadRelatedData = useCallback(async () => {
    if (!account?.id) return

    try {
      const [contactsData, oppsData, kdmData, allKdm] = await Promise.all([
        getContactsByAccount(account.id),
        getOpportunitiesByAccount(account.id),
        getKDMContactsByAccount(account.id),
        getKDMContacts(account.country_code),
      ])
      setContacts(contactsData || [])
      setOpportunities(oppsData || [])
      setKdmContacts(kdmData || [])
      setAllKdmContacts(allKdm || [])
    } catch (error) {
      console.error("Error loading related data:", error)
    }
  }, [account?.id, account?.country_code])

  // Load histórico data directly from DB
  const loadHistoricoData = useCallback(async () => {
    if (!account?.id) return

    try {
      const [activities, meetings] = await Promise.all([
        getActivitiesByAccount(account.id),
        getMeetingsByAccount(account.id),
      ])
      setHistoricoData({
        activities: activities || [],
        meetings: meetings || [],
      })
    } catch (error) {
      console.error("Error loading histórico:", error)
    }
  }, [account?.id])

  useEffect(() => {
    if (account) {
      setEditedAccount({ ...account })
      setFollowUpForm({
        firstContactAt: account.first_contact_at?.slice(0, 16) || "",
        lastContactAt: account.last_contact_at?.slice(0, 16) || "",
        nextFollowUpAt: account.next_follow_up_at?.slice(0, 16) || "",
        nextFollowUpLabel: account.next_follow_up_label || "",
      })
      loadRelatedData()
      loadHistoricoData()
    }
  }, [account, loadRelatedData, loadHistoricoData])

  // Build histórico from activities and meetings
  const allHistory = [
    ...historicoData.activities.map((a) => ({
      id: a.id,
      type: a.type as "email" | "note" | "call" | "meeting",
      summary: a.summary || a.subject || "",
      date: a.date_time,
      sortDate: a.date_time,
      details: a.details,
      source: "activity" as const,
    })),
    ...historicoData.meetings.map((m) => ({
      id: m.id,
      type: "meeting" as const,
      summary: `${m.kind} - ${m.notes || "Sin notas"}`,
      date: m.date_time,
      sortDate: m.date_time,
      details: { kind: m.kind, outcome: m.outcome },
      source: "meeting" as const,
    })),
  ]
    .filter((item) => historicoFilter === "all" || item.type === historicoFilter)
    .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())

  const handleSave = () => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await updateAccount({
          id: editedAccount.id,
          name: editedAccount.name,
          city: editedAccount.city,
          type: editedAccount.type as "privada" | "pública" | undefined,
          size: editedAccount.size as "pequeña" | "mediana" | "grande" | undefined,
          stage: editedAccount.stage as "lead" | "sql" | "opp" | "won" | "lost" | undefined,
          mrr: editedAccount.mrr,
          probability: editedAccount.probability,
          website: editedAccount.website,
          notes: editedAccount.notes,
        })
        toast.success("Guardado correctamente")
        onRefresh?.()
      } catch (error) {
        toast.error("Error al guardar")
      }
    })
  }

  const handleDelete = () => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await deleteAccount(editedAccount.id)
        toast.success("Eliminado correctamente")
        onOpenChange(false)
        onRefresh?.()
      } catch (error) {
        toast.error("Error al eliminar")
      }
    })
  }

  // Contact handlers
  const handleSaveContact = () => {
    if (!editedAccount || !contactForm.name) return

    startTransition(async () => {
      try {
        if (editingContact) {
          await updateContact({
            id: editingContact.id,
            name: contactForm.name,
            title: contactForm.title || undefined,
            role: contactForm.role || undefined,
            email: contactForm.email || undefined,
            whatsapp: contactForm.whatsapp || undefined,
          })
          toast.success("Contacto actualizado")
        } else {
          await createContact({
            account_id: editedAccount.id,
            name: contactForm.name,
            title: contactForm.title || undefined,
            role: contactForm.role || undefined,
            email: contactForm.email || undefined,
            whatsapp: contactForm.whatsapp || undefined,
          })
          toast.success("Contacto creado")
        }
        setContactDialogOpen(false)
        setEditingContact(null)
        setContactForm({ name: "", title: "", role: "", email: "", whatsapp: "" })
        loadRelatedData()
      } catch (error) {
        toast.error("Error al guardar contacto")
      }
    })
  }

  const handleDeleteContact = (id: string) => {
    startTransition(async () => {
      try {
        await deleteContact(id)
        toast.success("Contacto eliminado")
        loadRelatedData()
      } catch (error) {
        toast.error("Error al eliminar")
      }
    })
  }

  const handleLinkKDM = (kdmId: string, isPrimary = false) => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await linkKDMToAccount(kdmId, editedAccount.id, editedAccount.country_code, isPrimary)
        toast.success("KDM vinculado")
        setKdmDialogOpen(false)
        loadRelatedData()
      } catch (error) {
        toast.error("Error al vincular KDM")
      }
    })
  }

  const handleUnlinkKDM = (kdmId: string) => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await unlinkKDMFromAccount(kdmId, editedAccount.id)
        toast.success("KDM desvinculado")
        loadRelatedData()
      } catch (error) {
        toast.error("Error al desvincular")
      }
    })
  }

  const handleCreateAndLinkKDM = () => {
    if (!editedAccount || !newKdmForm.first_name || !newKdmForm.last_name) {
      toast.error("Nombre y apellido son requeridos")
      return
    }

    startTransition(async () => {
      try {
        await createKDMContact(
          {
            first_name: newKdmForm.first_name,
            last_name: newKdmForm.last_name,
            role_title: newKdmForm.role_title || null,
            email: newKdmForm.email || null,
            phone: newKdmForm.phone || null,
          },
          editedAccount.id,
          editedAccount.country_code,
        )
        toast.success("KDM creado y vinculado")
        setNewKdmDialogOpen(false)
        setNewKdmForm({ first_name: "", last_name: "", role_title: "", email: "", phone: "" })
        loadRelatedData()
      } catch (error) {
        toast.error("Error al crear KDM")
      }
    })
  }

  // Histórico handlers
  const handleAddQuickNote = () => {
    if (!editedAccount || !newActivitySummary.trim()) return

    startTransition(async () => {
      try {
        await createActivity({
          account_id: editedAccount.id,
          country_code: editedAccount.country_code,
          type: "note",
          summary: newActivitySummary,
          date_time: new Date().toISOString(),
        })
        toast.success("Nota guardada")
        setNewActivitySummary("")
        loadHistoricoData()
      } catch (error) {
        toast.error("Error al guardar nota")
      }
    })
  }

  const handleSaveEmail = () => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await createActivity({
          account_id: editedAccount.id,
          country_code: editedAccount.country_code,
          type: "email",
          subject: emailForm.subject,
          summary: emailForm.summary,
          date_time: emailForm.dateTime || new Date().toISOString(),
          details: {
            result: emailForm.result,
            requires_follow_up: emailForm.requiresFollowUp,
            follow_up_date: emailForm.followUpDate || null,
          },
          requires_follow_up: emailForm.requiresFollowUp,
        })

        // Update follow up if needed
        if (emailForm.requiresFollowUp && emailForm.followUpDate) {
          await updateAccount({
            id: editedAccount.id,
            next_follow_up_at: emailForm.followUpDate,
            next_follow_up_label: `Seguimiento email: ${emailForm.subject}`,
          })
        }

        toast.success("Email registrado")
        setEmailDialogOpen(false)
        setEmailForm({
          dateTime: "",
          subject: "",
          summary: "",
          result: "enviado",
          requiresFollowUp: false,
          followUpDate: "",
        })
        loadHistoricoData()
        onRefresh?.()
      } catch (error) {
        toast.error("Error al registrar email")
      }
    })
  }

  const handleSaveMeeting = () => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await createMeeting({
          account_id: editedAccount.id,
          country_code: editedAccount.country_code,
          kind: meetingForm.kind,
          notes: meetingForm.notes,
          date_time: meetingForm.dateTime || new Date().toISOString(),
        })

        // Also create an activity for the histórico
        await createActivity({
          account_id: editedAccount.id,
          country_code: editedAccount.country_code,
          type: "meeting",
          summary: `Reunión ${meetingForm.kind}: ${meetingForm.notes || "Sin notas"}`,
          date_time: meetingForm.dateTime || new Date().toISOString(),
          details: { kind: meetingForm.kind },
        })

        toast.success("Reunión agendada")
        setMeetingDialogOpen(false)
        setMeetingForm({ dateTime: "", kind: "Discovery", notes: "" })
        loadHistoricoData()
        onRefresh?.()
      } catch (error) {
        toast.error("Error al agendar reunión")
      }
    })
  }

  const handleSaveFollowUp = () => {
    if (!editedAccount) return

    startTransition(async () => {
      try {
        await updateAccount({
          id: editedAccount.id,
          first_contact_at: followUpForm.firstContactAt || undefined,
          last_contact_at: followUpForm.lastContactAt || undefined,
          next_follow_up_at: followUpForm.nextFollowUpAt || undefined,
          next_follow_up_label: followUpForm.nextFollowUpLabel || undefined,
        })
        toast.success("Seguimiento actualizado")
        setFollowUpDialogOpen(false)
        onRefresh?.()
      } catch (error) {
        toast.error("Error al actualizar seguimiento")
      }
    })
  }

  const handleSaveFitComercial = (fit: string) => {
    if (!editedAccount) return

    const normalizedFit = fit.toLowerCase()

    startTransition(async () => {
      try {
        // Note: fit_comercial is not in AccountUpdate type, so we only update it locally
        setEditedAccount({ ...editedAccount, fit_comercial: normalizedFit })
        await updateAccount({
          id: editedAccount.id,
        })

        // Create activity for histórico
        await createActivity({
          account_id: editedAccount.id,
          country_code: editedAccount.country_code,
          type: "note",
          summary: `Fit comercial actualizado a: ${normalizedFit.charAt(0).toUpperCase() + normalizedFit.slice(1)}`,
          date_time: new Date().toISOString(),
        })

        setEditedAccount({ ...editedAccount, fit_comercial: normalizedFit })
        toast.success("Fit comercial actualizado")
        setFitComercialDialogOpen(false)
        loadHistoricoData()
        onRefresh?.()
      } catch (error) {
        toast.error("Error al actualizar fit comercial")
      }
    })
  }

  const handleDeleteHistoricoItem = (item: (typeof allHistory)[0]) => {
    startTransition(async () => {
      try {
        if (item.source === "activity") {
          await deleteActivity(item.id)
        } else {
          await deleteMeeting(item.id)
        }
        toast.success("Eliminado")
        loadHistoricoData()
      } catch (error) {
        toast.error("Error al eliminar")
      }
    })
  }

  if (!editedAccount) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editedAccount.name}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {editedAccount.city} • {editedAccount.type}
              </p>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={editedAccount.type || ""}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Privada">Privada</SelectItem>
                        <SelectItem value="Pública">Pública</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tamaño</Label>
                    <Select
                      value={editedAccount.size || ""}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pequeña">Pequeña</SelectItem>
                        <SelectItem value="Mediana">Mediana</SelectItem>
                        <SelectItem value="Grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fit Comercial</Label>
                    <Select
                      value={editedAccount.fit_comercial || ""}
                      onValueChange={(v) => setEditedAccount({ ...editedAccount, fit_comercial: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="bajo">Bajo</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>MRR Estimado</Label>
                    <Input
                      type="number"
                      value={editedAccount.mrr || ""}
                      onChange={(e) =>
                        setEditedAccount({ ...editedAccount, mrr: Number.parseFloat(e.target.value) || 0 })
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
                    placeholder="https://..."
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

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isPending} className="flex-1">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="w-full">
                  Eliminar
                </Button>
              </TabsContent>

              {/* Contactos Tab */}
              <TabsContent value="contactos" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      KDM - Tomadores de Decisión
                    </h3>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setKdmDialogOpen(true)}>
                        Vincular
                      </Button>
                      <Button size="sm" onClick={() => setNewKdmDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {kdmContacts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-3 text-sm">No hay KDM vinculados</p>
                  ) : (
                    <div className="space-y-2">
                      {kdmContacts.map((kdm) => (
                        <div
                          key={kdm.id}
                          className="flex items-start justify-between p-3 rounded-lg border bg-primary/5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {kdm.first_name} {kdm.last_name}
                              </span>
                              {kdm.is_primary && (
                                <Badge className="bg-primary text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Principal
                                </Badge>
                              )}
                            </div>
                            {kdm.role_title && <p className="text-sm text-muted-foreground">{kdm.role_title}</p>}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {kdm.email && (
                                <a
                                  href={`mailto:${kdm.email}`}
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Mail className="h-3 w-3" />
                                  {kdm.email}
                                </a>
                              )}
                              {kdm.phone && (
                                <a
                                  href={`https://wa.me/${kdm.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3" />
                                  {kdm.phone}
                                </a>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleUnlinkKDM(kdm.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Otros Contactos
                    </h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingContact(null)
                        setContactForm({ name: "", title: "", role: "", email: "", whatsapp: "" })
                        setContactDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {contacts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-3 text-sm">No hay contactos</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="flex items-start justify-between p-3 rounded-lg border">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{contact.name}</span>
                              {contact.role && (
                                <Badge variant="secondary" className="text-xs">
                                  {contact.role === "KDM"
                                    ? "KDM"
                                    : contact.role === "influencer"
                                      ? "Influencer"
                                      : "Procurement"}
                                </Badge>
                              )}
                            </div>
                            {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </a>
                              )}
                              {contact.whatsapp && (
                                <a
                                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="h-3 w-3" />
                                  {contact.whatsapp}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingContact(contact)
                                setContactForm({
                                  name: contact.name,
                                  title: contact.title || "",
                                  role: (contact.role === "kdm" ? "KDM" : (contact.role as "" | "KDM" | "influencer" | "procurement")) || "",
                                  email: contact.email || "",
                                  whatsapp: contact.whatsapp || "",
                                })
                                setContactDialogOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Opps Tab */}
              <TabsContent value="opps" className="space-y-4 mt-6">
                {opportunities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay oportunidades</p>
                ) : (
                  <div className="space-y-2">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium">{opp.product || "MyWorkIn"}</span>
                            <Badge
                              variant={
                                opp.stage === "won" ? "default" : opp.stage === "lost" ? "destructive" : "secondary"
                              }
                            >
                              {opp.stage}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${opp.mrr?.toLocaleString() || 0} MRR • {opp.probability || 0}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Histórico Tab */}
              <TabsContent value="historico" className="space-y-4 mt-6">
                {/* Status bar */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Primer contacto</p>
                    <p className="text-sm font-medium">
                      {editedAccount.first_contact_at
                        ? new Date(editedAccount.first_contact_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Último contacto</p>
                    <p className="text-sm font-medium">
                      {editedAccount.last_contact_at
                        ? new Date(editedAccount.last_contact_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Próximo</p>
                    <p className="text-sm font-medium">
                      {editedAccount.next_follow_up_at
                        ? new Date(editedAccount.next_follow_up_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Quick note input */}
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
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
                    className="bg-transparent"
                    onClick={() => {
                      setMeetingForm({
                        dateTime: new Date().toISOString().slice(0, 16),
                        kind: "Discovery",
                        notes: "",
                      })
                      setMeetingDialogOpen(true)
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar reunión
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => setFollowUpDialogOpen(true)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Editar seguimiento
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                    onClick={() => setFitComercialDialogOpen(true)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Cambiar Fit
                  </Button>
                </div>

                {/* Filter & Refresh */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {(["all", "email", "meeting", "note", "call"] as const).map((f) => (
                      <Button
                        key={f}
                        variant={historicoFilter === f ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setHistoricoFilter(f)}
                      >
                        {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" onClick={loadHistoricoData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* History list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {allHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No hay actividades registradas</p>
                  ) : (
                    allHistory.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="mt-0.5">
                          {item.type === "email" && <Mail className="h-4 w-4 text-blue-500" />}
                          {item.type === "meeting" && <Video className="h-4 w-4 text-purple-500" />}
                          {item.type === "note" && <MessageSquare className="h-4 w-4 text-gray-500" />}
                          {item.type === "call" && <Phone className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{item.summary}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteHistoricoItem(item)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={contactForm.title}
                  onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={contactForm.role}
                onValueChange={(v) => setContactForm({ ...contactForm, role: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KDM">KDM</SelectItem>
                  <SelectItem value="influencer">Influencer</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={contactForm.whatsapp}
                  onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingContact ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={kdmDialogOpen} onOpenChange={setKdmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular KDM existente</DialogTitle>
            <DialogDescription>Selecciona un KDM para vincular a esta universidad</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
            {allKdmContacts
              .filter((k) => !kdmContacts.some((linked) => linked.id === k.id))
              .map((kdm) => (
                <div key={kdm.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                  <div>
                    <p className="font-medium">
                      {kdm.first_name} {kdm.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{kdm.role_title || kdm.email || "Sin información"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleLinkKDM(kdm.id, false)}>
                      Vincular
                    </Button>
                    <Button size="sm" onClick={() => handleLinkKDM(kdm.id, true)}>
                      <Star className="h-4 w-4 mr-1" />
                      Principal
                    </Button>
                  </div>
                </div>
              ))}
            {allKdmContacts.filter((k) => !kdmContacts.some((linked) => linked.id === k.id)).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No hay KDM disponibles para vincular</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKdmDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newKdmDialogOpen} onOpenChange={setNewKdmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear y vincular KDM</DialogTitle>
            <DialogDescription>El nuevo KDM quedará vinculado a esta universidad</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={newKdmForm.first_name}
                  onChange={(e) => setNewKdmForm({ ...newKdmForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input
                  value={newKdmForm.last_name}
                  onChange={(e) => setNewKdmForm({ ...newKdmForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={newKdmForm.role_title}
                onChange={(e) => setNewKdmForm({ ...newKdmForm, role_title: e.target.value })}
                placeholder="Rector, Director, Decano..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newKdmForm.email}
                  onChange={(e) => setNewKdmForm({ ...newKdmForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={newKdmForm.phone}
                  onChange={(e) => setNewKdmForm({ ...newKdmForm, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewKdmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAndLinkKDM} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear y vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Email</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Fecha y hora</Label>
              <Input
                type="datetime-local"
                value={emailForm.dateTime}
                onChange={(e) => setEmailForm({ ...emailForm, dateTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Asunto</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder="Asunto del email"
              />
            </div>
            <div className="space-y-2">
              <Label>Resumen</Label>
              <Textarea
                value={emailForm.summary}
                onChange={(e) => setEmailForm({ ...emailForm, summary: e.target.value })}
                placeholder="Descripción del email..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado</Label>
              <Select value={emailForm.result} onValueChange={(v) => setEmailForm({ ...emailForm, result: v as any })}>
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
            <div className="flex items-center gap-2">
              <Switch
                checked={emailForm.requiresFollowUp}
                onCheckedChange={(v) => setEmailForm({ ...emailForm, requiresFollowUp: v })}
              />
              <Label>Requiere seguimiento</Label>
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
            <Button onClick={handleSaveEmail} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Fecha y hora</Label>
              <Input
                type="datetime-local"
                value={meetingForm.dateTime}
                onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={meetingForm.kind}
                onValueChange={(v) => setMeetingForm({ ...meetingForm, kind: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discovery">Discovery</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                  <SelectItem value="Propuesta">Propuesta</SelectItem>
                  <SelectItem value="Kickoff">Kickoff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={meetingForm.notes}
                onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                placeholder="Notas de la reunión..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMeeting} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow Up Dialog */}
      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Seguimiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label>Motivo</Label>
              <Input
                value={followUpForm.nextFollowUpLabel}
                onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpLabel: e.target.value })}
                placeholder="Ej: Enviar propuesta, Confirmar demo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFollowUp} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fitComercialDialogOpen} onOpenChange={setFitComercialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Fit Comercial</DialogTitle>
            <DialogDescription>Selecciona el nivel de fit comercial para esta universidad</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-6">
            <Button
              variant="outline"
              className={`h-20 flex-col gap-2 ${editedAccount.fit_comercial === "alto" ? "ring-2 ring-green-500 bg-green-50" : ""}`}
              onClick={() => handleSaveFitComercial("alto")}
              disabled={isPending}
            >
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-600">Alto</span>
            </Button>
            <Button
              variant="outline"
              className={`h-20 flex-col gap-2 ${editedAccount.fit_comercial === "medio" ? "ring-2 ring-yellow-500 bg-yellow-50" : ""}`}
              onClick={() => handleSaveFitComercial("medio")}
              disabled={isPending}
            >
              <TrendingUp className="h-6 w-6 text-yellow-600" />
              <span className="font-semibold text-yellow-600">Medio</span>
            </Button>
            <Button
              variant="outline"
              className={`h-20 flex-col gap-2 ${editedAccount.fit_comercial === "bajo" ? "ring-2 ring-red-500 bg-red-50" : ""}`}
              onClick={() => handleSaveFitComercial("bajo")}
              disabled={isPending}
            >
              <TrendingUp className="h-6 w-6 text-red-600" />
              <span className="font-semibold text-red-600">Bajo</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFitComercialDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
