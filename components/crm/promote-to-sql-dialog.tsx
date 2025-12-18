"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, ArrowRight, Loader2, Building2 } from "lucide-react"
import { getAccountsByStage, updateAccount } from "@/lib/actions/accounts"

interface Account {
  id: string
  name: string
  city: string | null
  type: "privada" | "pública" | null
  icp_fit: number | null
  owner_id: string | null
}

interface PromoteToSQLDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryCode: string
  onSuccess?: () => void
}

export function PromoteToSQLDialog({ open, onOpenChange, countryCode, onSuccess }: PromoteToSQLDialogProps) {
  const [leads, setLeads] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAccountsByStage(countryCode, "lead")
      setLeads((data as Account[]) || [])
    } catch (error) {
      console.error("Error loading leads:", error)
      toast.error("Error al cargar los leads")
    } finally {
      setIsLoading(false)
    }
  }, [countryCode])

  useEffect(() => {
    if (open) {
      loadLeads()
      setSearchQuery("")
    }
  }, [open, loadLeads])

  const handlePromote = async (lead: Account) => {
    setPromotingId(lead.id)
    try {
      await updateAccount({ id: lead.id, stage: "sql" })
      toast.success(`${lead.name} promovido a SQL`)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error promoting lead:", error)
      toast.error("Error al promover el lead")
    } finally {
      setPromotingId(null)
    }
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Promover Lead a SQL</DialogTitle>
          <DialogDescription>
            Selecciona un Lead existente que quiere avanzar en la compra para convertirlo en SQL
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lead por nombre o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] space-y-2 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mb-2 opacity-50" />
              {leads.length === 0 ? (
                <>
                  <p className="font-medium">No hay leads disponibles</p>
                  <p className="text-sm">Primero debes crear leads en la sección de Leads (ICP)</p>
                </>
              ) : (
                <>
                  <p className="font-medium">No se encontraron resultados</p>
                  <p className="text-sm">Intenta con otro término de búsqueda</p>
                </>
              )}
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lead.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{lead.city || "Sin ciudad"}</span>
                    {lead.type && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {lead.type}
                        </Badge>
                      </>
                    )}
                    {lead.icp_fit !== null && (
                      <>
                        <span>•</span>
                        <span>ICP: {lead.icp_fit}%</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handlePromote(lead)}
                  disabled={promotingId === lead.id}
                  className="ml-2 gap-1"
                >
                  {promotingId === lead.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Promover
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t text-sm text-muted-foreground">
          <span>{filteredLeads.length} lead(s) disponible(s)</span>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
