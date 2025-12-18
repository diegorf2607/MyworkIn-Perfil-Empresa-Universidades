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
import { createMeeting } from "@/lib/actions/meetings"
import { getAccounts } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"
import { Loader2, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Account {
  id: string
  name: string
  city: string | null
}

interface TeamMember {
  id: string
  name: string
}

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryCode: string
  onSuccess?: () => void
}

export function CreateMeetingDialog({ open, onOpenChange, countryCode, onSuccess }: CreateMeetingDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [accountOpen, setAccountOpen] = useState(false)
  const [formData, setFormData] = useState({
    account_id: "",
    owner_id: "",
    kind: "Discovery" as "Discovery" | "Demo" | "Propuesta" | "Kickoff",
    date_time: "",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      Promise.all([getAccounts(), getTeamMembers()]).then(([accountsData, teamData]) => {
        const filtered = (accountsData || [])
          .filter((a) => a.country_code === countryCode)
          .map((a) => ({ id: a.id, name: a.name, city: a.city }))
        setAccounts(filtered)
        setTeamMembers(teamData || [])
        if (teamData && teamData.length > 0) {
          setFormData((prev) => ({ ...prev, owner_id: teamData[0].id }))
        }
      })
      // Set default date/time to tomorrow at 10am
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      setFormData((prev) => ({ ...prev, date_time: tomorrow.toISOString().slice(0, 16) }))
    }
  }, [open, countryCode])

  const selectedAccount = accounts.find((a) => a.id === formData.account_id)

  const handleSubmit = () => {
    if (!formData.account_id) {
      toast.error("Selecciona una universidad")
      return
    }
    if (!formData.date_time) {
      toast.error("Selecciona fecha y hora")
      return
    }

    startTransition(async () => {
      try {
        await createMeeting({
          country_code: countryCode,
          account_id: formData.account_id,
          owner_id: formData.owner_id || null,
          kind: formData.kind,
          date_time: new Date(formData.date_time).toISOString(),
          outcome: "pending",
          notes: formData.notes || null,
        })

        toast.success("Reunión agendada")
        onOpenChange(false)
        setFormData({
          account_id: "",
          owner_id: teamMembers[0]?.id || "",
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
          <div className="space-y-2">
            <Label>Universidad *</Label>
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={accountOpen}
                  className="w-full justify-between bg-transparent"
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
                      {accounts.map((account) => (
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
                            <p className="text-xs text-muted-foreground">{account.city}</p>
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
              <Label>Responsable</Label>
              <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
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
          <Button onClick={handleSubmit} disabled={isPending}>
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
