"use client"

import { useState, useTransition, useEffect } from "react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createMeeting } from "@/lib/actions/meetings"
import { getAccounts } from "@/lib/actions/accounts"
import { getActiveTeamMembersByCountry } from "@/lib/actions/team"
import { getCountries } from "@/lib/actions/countries"
import { toast } from "sonner"
import { Loader2, ChevronsUpDown, Check, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Account {
  id: string
  name: string
  city: string | null
  country_code: string
}

interface TeamMember {
  id: string
  name: string
  country_codes?: string[]
}

interface Country {
  code: string
  name: string
  active: boolean
}

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryCode: string // Can be "ALL" for global view
  onSuccess?: () => void
}

export function CreateMeetingDialog({ open, onOpenChange, countryCode, onSuccess }: CreateMeetingDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [accountOpen, setAccountOpen] = useState(false)

  const isGlobalView = countryCode === "ALL"

  const [formData, setFormData] = useState({
    account_id: "",
    owner_id: "",
    selected_country: "", // Only used in global view
    kind: "Discovery" as "Discovery" | "Demo" | "Propuesta" | "Kickoff",
    date_time: "",
    notes: "",
  })

  // Determine effective country code
  const effectiveCountry = isGlobalView ? formData.selected_country : countryCode

  useEffect(() => {
    if (open) {
      // Load initial data
      Promise.all([getAccounts(), getCountries()]).then(([accountsData, countriesData]) => {
        const activeCountries = (countriesData || []).filter((c) => c.active)
        setCountries(activeCountries)

        if (isGlobalView) {
          // For global view, show all accounts
          setAccounts(
            (accountsData || []).map((a) => ({
              id: a.id,
              name: a.name,
              city: a.city,
              country_code: a.country_code,
            })),
          )
        } else {
          // Filter accounts by country
          const filtered = (accountsData || [])
            .filter((a) => a.country_code === countryCode)
            .map((a) => ({ id: a.id, name: a.name, city: a.city, country_code: a.country_code }))
          setAccounts(filtered)
        }
      })

      // Set default date/time to tomorrow at 10am
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      setFormData((prev) => ({ ...prev, date_time: tomorrow.toISOString().slice(0, 16) }))
    }
  }, [open, countryCode, isGlobalView])

  // Load team members when effective country changes
  useEffect(() => {
    if (open && effectiveCountry) {
      getActiveTeamMembersByCountry(effectiveCountry).then((data) => {
        setTeamMembers(data || [])
        // Auto-select first member if available
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, owner_id: data[0].id }))
        } else {
          setFormData((prev) => ({ ...prev, owner_id: "" }))
        }
      })
    } else if (open && isGlobalView && !effectiveCountry) {
      // In global view without country selected, clear team members
      setTeamMembers([])
      setFormData((prev) => ({ ...prev, owner_id: "" }))
    }
  }, [open, effectiveCountry, isGlobalView])

  const selectedAccount = accounts.find((a) => a.id === formData.account_id)

  // Filter accounts by selected country in global view
  const filteredAccounts = isGlobalView
    ? formData.selected_country
      ? accounts.filter((a) => a.country_code === formData.selected_country)
      : accounts
    : accounts

  const handleSubmit = () => {
    // Validation
    if (isGlobalView && !formData.selected_country) {
      toast.error("Selecciona un país primero")
      return
    }
    if (!formData.account_id) {
      toast.error("Selecciona una universidad")
      return
    }
    if (!formData.date_time) {
      toast.error("Selecciona fecha y hora")
      return
    }
    if (!formData.owner_id) {
      toast.error("Selecciona un responsable")
      return
    }

    startTransition(async () => {
      try {
        await createMeeting({
          country_code: effectiveCountry,
          account_id: formData.account_id,
          owner_id: formData.owner_id,
          kind: formData.kind,
          date_time: new Date(formData.date_time).toISOString(),
          outcome: "pending",
          notes: formData.notes || null,
        })

        toast.success("Reunión agendada")
        onOpenChange(false)
        setFormData({
          account_id: "",
          owner_id: "",
          selected_country: "",
          kind: "Discovery",
          date_time: "",
          notes: "",
        })
        router.refresh()
        onSuccess?.()
      } catch (error) {
        toast.error("Error al agendar reunión")
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Reunión</DialogTitle>
          <DialogDescription>Programa una reunión con una universidad</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isGlobalView && (
            <div className="space-y-2">
              <Label>País *</Label>
              <Select
                value={formData.selected_country}
                onValueChange={(v) => {
                  setFormData({ ...formData, selected_country: v, account_id: "", owner_id: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un país..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Universidad *</Label>
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={accountOpen}
                  className="w-full justify-between bg-transparent"
                  disabled={isGlobalView && !formData.selected_country}
                >
                  {selectedAccount ? selectedAccount.name : "Selecciona universidad..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar universidad..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron universidades</CommandEmpty>
                    <CommandGroup>
                      {filteredAccounts.map((account) => (
                        <CommandItem
                          key={account.id}
                          value={account.name}
                          onSelect={() => {
                            setFormData({ ...formData, account_id: account.id })
                            setAccountOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.account_id === account.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div>
                            <p>{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.city} {isGlobalView && `• ${account.country_code}`}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de reunión</Label>
              <Select
                value={formData.kind}
                onValueChange={(v) => setFormData({ ...formData, kind: v as typeof formData.kind })}
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
              <Label>Responsable *</Label>
              <Select
                value={formData.owner_id}
                onValueChange={(v) => setFormData({ ...formData, owner_id: v })}
                disabled={teamMembers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={teamMembers.length === 0 ? "Sin miembros" : "Seleccionar..."} />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {effectiveCountry && teamMembers.length === 0 && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No hay miembros del equipo asignados a este país.{" "}
                <a href={`/c/${effectiveCountry}/admin/team`} className="text-primary underline">
                  Ir a Equipo Comercial
                </a>{" "}
                para asignar uno.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Fecha y hora *</Label>
            <Input
              type="datetime-local"
              value={formData.date_time}
              onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agenda, participantes, notas previas..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || (effectiveCountry && teamMembers.length === 0)}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Agendar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
