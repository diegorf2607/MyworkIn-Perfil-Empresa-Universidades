"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { createOpportunity } from "@/lib/actions/opportunities"
import { updateAccount, getAccounts } from "@/lib/actions/accounts"
import { toast } from "sonner"
import { Loader2, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/lib/context/workspace-context"

interface Account {
  id: string
  name: string
  city: string | null
  stage: string | null
}

interface CreateOpportunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryCode: string
  onSuccess?: () => void
}

export function CreateOpportunityDialog({ open, onOpenChange, countryCode, onSuccess }: CreateOpportunityDialogProps) {
  const router = useRouter()
  const { config } = useWorkspace()
  const [isPending, startTransition] = useTransition()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountOpen, setAccountOpen] = useState(false)
  const [formData, setFormData] = useState({
    account_id: "",
    product: "MyWorkIn (integral)",
    stage: "discovery" as "discovery" | "demo" | "propuesta" | "negociacion",
    mrr: 5000,
    one_time_payment: 0,
    probability: 20,
    next_step: "Agendar discovery call",
  })

  useEffect(() => {
    if (open) {
      getAccounts(undefined, config.workspace).then((data) => {
        const countryUpper = countryCode.toUpperCase()
        const filtered = (data || [])
          .filter((a) => a.country_code?.toUpperCase() === countryUpper)
          .map((a) => ({
            id: a.id,
            name: a.name,
            city: a.city,
            stage: a.stage,
          }))
        setAccounts(filtered)
      })
    }
  }, [open, countryCode, config.workspace])

  const selectedAccount = accounts.find((a) => a.id === formData.account_id)

  const handleSubmit = () => {
    if (!formData.account_id) {
      toast.error(`Selecciona una ${config.terminology.entity.toLowerCase()}`)
      return
    }

    startTransition(async () => {
      try {
        await createOpportunity({
          country_code: countryCode,
          account_id: formData.account_id,
          product: formData.product,
          stage: formData.stage,
          mrr: formData.mrr,
          one_time_payment: formData.one_time_payment || undefined,
          probability: formData.probability,
          next_step: formData.next_step || undefined,
          workspace_id: config.workspace,
        })

        // Update account stage to 'opp' if it was lead or sql
        const account = accounts.find((a) => a.id === formData.account_id)
        if (account && (account.stage === "lead" || account.stage === "sql")) {
          await updateAccount({ id: formData.account_id, stage: "opp" })
        }

        toast.success("Oportunidad creada")
        onOpenChange(false)
        setFormData({
          account_id: "",
          product: "MyWorkIn (integral)",
          stage: "discovery",
          mrr: 5000,
          one_time_payment: 0,
          probability: 20,
          next_step: "Agendar discovery call",
        })
        router.refresh()
        onSuccess?.()
      } catch (error) {
        toast.error("Error al crear oportunidad")
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Oportunidad</DialogTitle>
          <DialogDescription>Crea una nueva oportunidad para una {config.terminology.entity.toLowerCase()} existente</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{config.terminology.entity} *</Label>
            <Popover open={accountOpen} onOpenChange={setAccountOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={accountOpen}
                  className="w-full justify-between bg-transparent"
                >
                  {selectedAccount ? selectedAccount.name : config.terminology.selectEntityPlaceholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder={config.terminology.searchEntityPlaceholder} />
                  <CommandList>
                    <CommandEmpty>No se encontraron {config.terminology.entities.toLowerCase()}</CommandEmpty>
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
                            <p className="text-xs text-muted-foreground">
                              {account.city} • {account.stage?.toUpperCase()}
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
              <Label>Producto</Label>
              <Input value={formData.product} disabled />
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <Select
                value={formData.stage}
                onValueChange={(v) => setFormData({ ...formData, stage: v as typeof formData.stage })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="propuesta">Propuesta</SelectItem>
                  <SelectItem value="negociacion">Negociación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>MRR Estimado ($)</Label>
              <Input
                type="number"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pago Único ($)</Label>
              <Input
                type="number"
                value={formData.one_time_payment}
                onChange={(e) => setFormData({ ...formData, one_time_payment: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Probabilidad (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: Number.parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label>Próximo paso</Label>
            <Input
              value={formData.next_step}
              onChange={(e) => setFormData({ ...formData, next_step: e.target.value })}
              placeholder="Agendar discovery call..."
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
