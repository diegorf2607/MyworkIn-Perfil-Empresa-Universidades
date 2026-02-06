"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Building2, Handshake, Calendar, FileText, Users, Mail, Link, Loader2 } from "lucide-react"
import { createAccount, getAccounts } from "@/lib/actions/accounts"
import { createOpportunity } from "@/lib/actions/opportunities"
import { createMeeting } from "@/lib/actions/meetings"
import { createActivity } from "@/lib/actions/activities"
import { createContact } from "@/lib/actions/contacts"
import { createResource } from "@/lib/actions/resources"
import { createSequence } from "@/lib/actions/sequences"
import { useWorkspace } from "@/lib/context/workspace-context"

interface Country {
  code: string
  name: string
  active: boolean
}

interface Account {
  id: string
  country_code: string
  name: string
}

interface NewEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCountryCode?: string
  countries: Country[]
  accounts?: Account[]
  onRefresh?: () => void
}

type EntityType = "universidad" | "oportunidad" | "reunion" | "actividad" | "contacto" | "recurso" | "secuencia"

// Function to get entity types with dynamic labels
const getEntityTypes = (entityLabel: string) => [
  { value: "universidad" as const, label: entityLabel, icon: Building2 },
  { value: "oportunidad" as const, label: "Oportunidad", icon: Handshake },
  { value: "reunion" as const, label: "Reunión", icon: Calendar },
  { value: "actividad" as const, label: "Actividad", icon: FileText },
  { value: "contacto" as const, label: "Contacto", icon: Users },
  { value: "recurso" as const, label: "Recurso", icon: Link },
  { value: "secuencia" as const, label: "Secuencia", icon: Mail },
]

export function NewEntityDialog({
  open,
  onOpenChange,
  defaultCountryCode,
  countries,
  accounts: initialAccounts = [],
  onRefresh,
}: NewEntityDialogProps) {
  const { config } = useWorkspace()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const activeCountries = countries.filter((c) => c.active)

  const [step, setStep] = useState(1)
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode || "")
  const [selectedType, setSelectedType] = useState<EntityType | "">("")
  const [formData, setFormData] = useState<Record<string, string>>({})

  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const isCountryLocked = !!defaultCountryCode

  const loadAccounts = useCallback(async (countryCode: string) => {
    if (!countryCode) return
    setLoadingAccounts(true)
    try {
      const data = await getAccounts(countryCode)
      setAccounts(
        (data || []).map((a) => ({
          id: a.id,
          country_code: a.country_code,
          name: a.name,
        })),
      )
    } catch (error) {
      console.error("Error loading accounts:", error)
    } finally {
      setLoadingAccounts(false)
    }
  }, [])

  useEffect(() => {
    if (open && selectedCountry) {
      loadAccounts(selectedCountry)
    }
  }, [open, selectedCountry, loadAccounts])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelectedCountry(defaultCountryCode || "")
      setSelectedType("")
      setFormData({})
    }
  }, [open, defaultCountryCode])

  const handleNext = () => {
    if (step === 1 && !selectedCountry) {
      toast.error("Selecciona un país")
      return
    }
    if (step === 2 && !selectedType) {
      toast.error("Selecciona un tipo de entidad")
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleCreate = () => {
    if (!selectedType || !selectedCountry) return

    startTransition(async () => {
      try {
        switch (selectedType) {
          case "universidad":
            await createAccount({
              country_code: selectedCountry,
              name: formData.name || "Nueva Universidad",
              city: formData.city || undefined,
              type: (formData.type as "privada" | "pública") || "privada",
              website: formData.website || undefined,
              size: "mediana",
              icp_fit: 70,
              stage: "lead",
              source: "outbound",
              next_action: "Primer contacto",
              next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              probability: 20,
              mrr: 0,
              status: "activo",
            })
            toast.success("Universidad creada")
            break

          case "oportunidad":
            if (!formData.accountId) {
              toast.error("Selecciona una universidad")
              return
            }
            await createOpportunity({
              account_id: formData.accountId,
              country_code: selectedCountry,
              product: "MyWorkIn (integral)",
              stage: "discovery",
              probability: Number(formData.probability) || 20,
              mrr: Number(formData.mrr) || 0,
              next_step: formData.nextStep || "Agendar discovery call",
              next_step_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              workspace_id: config.id,
            })
            toast.success("Oportunidad creada")
            break

          case "reunion":
            if (!formData.accountId) {
              toast.error("Selecciona una universidad")
              return
            }
            await createMeeting({
              country_code: selectedCountry,
              account_id: formData.accountId,
              date_time: formData.dateTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              kind: (formData.kind as "Discovery" | "Demo" | "Propuesta" | "Kickoff") || "Discovery",
              outcome: "pending",
              notes: formData.notes || "",
            })
            toast.success("Reunión agendada")
            break

          case "actividad":
            if (!formData.accountId) {
              toast.error("Selecciona una universidad")
              return
            }
            await createActivity({
              country_code: selectedCountry,
              account_id: formData.accountId,
              type: (formData.type as "email" | "llamada" | "reunión" | "nota" | "linkedin" | "whatsapp") || "nota",
              summary: formData.summary || "",
            })
            toast.success("Actividad registrada")
            break

          case "contacto":
            if (!formData.accountId) {
              toast.error("Selecciona una universidad")
              return
            }
            await createContact({
              account_id: formData.accountId,
              name: formData.name || "Nuevo Contacto",
              role: (formData.role as "KDM" | "influencer" | "procurement") || "KDM",
              title: formData.title || undefined,
              email: formData.email || undefined,
              whatsapp: formData.whatsapp || undefined,
            })
            toast.success("Contacto creado")
            break

          case "recurso":
            await createResource({
              country_code: selectedCountry,
              category:
                (formData.category as
                  | "decks"
                  | "casos"
                  | "objeciones"
                  | "pricing"
                  | "looms"
                  | "legal"
                  | "implementacion") || "decks",
              title: formData.title || "Nuevo Recurso",
              description: formData.description || undefined,
              url: formData.url || "",
            })
            toast.success("Recurso creado")
            break

          case "secuencia":
            await createSequence({
              country_code: selectedCountry,
              channel: (formData.channel as "email" | "linkedin" | "whatsapp") || "email",
              name: formData.name || "Nueva Secuencia",
            })
            toast.success("Secuencia creada")
            break
        }

        // Reset and close
        setStep(1)
        setSelectedCountry(defaultCountryCode || "")
        setSelectedType("")
        setFormData({})
        onRefresh?.()
        onOpenChange(false)
      } catch (error) {
        toast.error("Error al crear")
        console.error(error)
      }
    })
  }

  const countryAccounts = accounts.filter((a) => a.country_code === selectedCountry)

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Label>País</Label>
            <Select
              value={selectedCountry}
              onValueChange={(v) => {
                setSelectedCountry(v)
                loadAccounts(v)
              }}
              disabled={isCountryLocked}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                {activeCountries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCountryLocked && (
              <p className="text-sm text-muted-foreground">País preseleccionado desde la vista actual</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Label>Tipo de entidad</Label>
            <div className="grid grid-cols-2 gap-3">
              {getEntityTypes(config.terminology.entity).map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedType(type.value)}
                >
                  <type.icon className="h-5 w-5" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            {selectedType === "universidad" && (
              <>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Universidad Nacional..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lima, Bogotá..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type || ""} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de universidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="privada">Privada</SelectItem>
                      <SelectItem value="pública">Pública</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedType === "oportunidad" && (
              <>
                <div className="space-y-2">
                  <Label>Universidad</Label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando universidades...
                    </div>
                  ) : (
                    <Select
                      value={formData.accountId || ""}
                      onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryAccounts.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            No hay universidades en este país
                          </SelectItem>
                        ) : (
                          countryAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {countryAccounts.length === 0 && !loadingAccounts && (
                    <p className="text-sm text-muted-foreground">Primero debes crear una universidad en este país</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>MRR Estimado</Label>
                  <Input
                    type="number"
                    value={formData.mrr || ""}
                    onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Próximo Paso</Label>
                  <Input
                    value={formData.nextStep || ""}
                    onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
                    placeholder="Agendar discovery call"
                  />
                </div>
              </>
            )}

            {selectedType === "reunion" && (
              <>
                <div className="space-y-2">
                  <Label>Universidad</Label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando universidades...
                    </div>
                  ) : (
                    <Select
                      value={formData.accountId || ""}
                      onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryAccounts.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            No hay universidades en este país
                          </SelectItem>
                        ) : (
                          countryAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Reunión</Label>
                  <Select value={formData.kind || ""} onValueChange={(v) => setFormData({ ...formData, kind: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
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
                  <Label>Fecha y Hora</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dateTime || ""}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  />
                </div>
              </>
            )}

            {selectedType === "actividad" && (
              <>
                <div className="space-y-2">
                  <Label>Universidad</Label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando universidades...
                    </div>
                  ) : (
                    <Select
                      value={formData.accountId || ""}
                      onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryAccounts.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            No hay universidades en este país
                          </SelectItem>
                        ) : (
                          countryAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Actividad</Label>
                  <Select value={formData.type || ""} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="llamada">Llamada</SelectItem>
                      <SelectItem value="reunión">Reunión</SelectItem>
                      <SelectItem value="nota">Nota</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resumen</Label>
                  <Input
                    value={formData.summary || ""}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Llamada de seguimiento..."
                  />
                </div>
              </>
            )}

            {selectedType === "contacto" && (
              <>
                <div className="space-y-2">
                  <Label>Universidad</Label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando universidades...
                    </div>
                  ) : (
                    <Select
                      value={formData.accountId || ""}
                      onValueChange={(v) => setFormData({ ...formData, accountId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona universidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryAccounts.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            No hay universidades en este país
                          </SelectItem>
                        ) : (
                          countryAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={formData.role || ""} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KDM">KDM</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="procurement">Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@universidad.edu"
                  />
                </div>
              </>
            )}

            {selectedType === "recurso" && (
              <>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="decks">Decks</SelectItem>
                      <SelectItem value="casos">Casos de Estudio</SelectItem>
                      <SelectItem value="objeciones">Objeciones</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="looms">Looms</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="implementacion">Implementación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Deck Comercial Q4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {selectedType === "secuencia" && (
              <>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select
                    value={formData.channel || ""}
                    onValueChange={(v) => setFormData({ ...formData, channel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Secuencia Outbound Q4"
                  />
                </div>
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Paso 1: País"}
            {step === 2 && "Paso 2: Tipo"}
            {step === 3 && "Paso 3: Detalles"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">{renderStepContent()}</div>

        <div className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Atrás
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext}>Siguiente</Button>
          ) : (
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
