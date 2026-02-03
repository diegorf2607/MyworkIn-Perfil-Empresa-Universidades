"use client"

import { useState, useMemo, useEffect, useCallback, useTransition } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { EntitySheet } from "@/components/crm/entity-sheet"
import { CreateOpportunityDialog } from "@/components/crm/create-opportunity-dialog"
import { KanbanBoard } from "@/components/crm/kanban-board"
import { Search, Filter, LayoutGrid, List, DollarSign, Loader2, Plus, Trophy, XCircle } from "lucide-react"
import { getOpportunities, updateOpportunity } from "@/lib/actions/opportunities"
import { getAccounts, updateAccount } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"
import { useWorkspace } from "@/lib/context/workspace-context"

interface Opportunity {
  id: string
  country_code: string
  account_id: string
  product: string
  stage: "discovery" | "demo" | "propuesta" | "negociacion" | "won" | "lost"
  mrr: number
  probability: number
  next_step: string | null
}

interface Account {
  id: string
  name: string
  city: string | null
  owner_id: string | null
}

interface TeamMember {
  id: string
  name: string
}

export default function OppsPage() {
  const { country } = useParams<{ country: string }>()
  const { workspace, config } = useWorkspace()
  const [isPending, startTransition] = useTransition()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closingOpp, setClosingOpp] = useState<Opportunity | null>(null)
  const [closeType, setCloseType] = useState<"won" | "lost">("won")
  const [lostReason, setLostReason] = useState("")

  const loadData = useCallback(async () => {
    try {
      const countryUpper = country.toUpperCase()
      const [oppsData, accountsData, teamData] = await Promise.all([
        getOpportunities(undefined, workspace),
        getAccounts(undefined, workspace),
        getTeamMembers(),
      ])
      const countryOpps = (oppsData || []).filter(
        (o) => o.country_code?.toUpperCase() === countryUpper && !["won", "lost"].includes(o.stage),
      )
      const countryAccounts = (accountsData || []).filter((a) => a.country_code?.toUpperCase() === countryUpper)
      setOpportunities(countryOpps as Opportunity[])
      setAccounts(countryAccounts)
      setTeamMembers(teamData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country, workspace])

  useEffect(() => {
    loadData()
  }, [loadData])

  const activeOpps = useMemo(() => {
    let filtered = [...opportunities]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((o) => {
        const acc = accounts.find((a) => a.id === o.account_id)
        return acc?.name.toLowerCase().includes(query)
      })
    }

    if (filterOwner !== "all") {
      filtered = filtered.filter((o) => {
        const acc = accounts.find((a) => a.id === o.account_id)
        return acc?.owner_id === filterOwner
      })
    }

    return filtered
  }, [opportunities, searchQuery, filterOwner, accounts])

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Sin asignar"
  }

  const getAccountCity = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.city || ""
  }

  const getOwnerName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account?.owner_id) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === account.owner_id)
    return member?.name || "Sin asignar"
  }

  const handleRowClick = (opp: Opportunity) => {
    const account = accounts.find((a) => a.id === opp.account_id)
    if (account) {
      setSelectedAccount(account)
      setSheetOpen(true)
    }
  }

  const handleStageChange = async (oppId: string, newStage: string) => {
    try {
      await updateOpportunity({ id: oppId, stage: newStage as Opportunity["stage"] })
      loadData()
    } catch (error) {
      console.error("Error updating stage:", error)
    }
  }

  const handleOpenCloseDialog = (opp: Opportunity, type: "won" | "lost") => {
    setClosingOpp(opp)
    setCloseType(type)
    setLostReason("")
    setCloseDialogOpen(true)
  }

  const handleCloseOpportunity = () => {
    if (!closingOpp) return

    startTransition(async () => {
      try {
        // Update opportunity stage
        await updateOpportunity({
          id: closingOpp.id,
          stage: closeType,
          lost_reason: closeType === "lost" ? lostReason : undefined,
        })

        // Update account stage
        await updateAccount({
          id: closingOpp.account_id,
          stage: closeType,
        })

        toast.success(closeType === "won" ? "¡Oportunidad ganada!" : "Oportunidad marcada como perdida")
        setCloseDialogOpen(false)
        setClosingOpp(null)
        loadData()
      } catch (error) {
        toast.error("Error al cerrar oportunidad")
        console.error(error)
      }
    })
  }

  const totalPipeline = activeOpps.reduce((sum, o) => sum + o.mrr, 0)
  const weightedPipeline = activeOpps.reduce((sum, o) => sum + (o.mrr * o.probability) / 100, 0)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Oportunidades</h1>
          <p className="text-muted-foreground">Pipeline de ventas activo</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Total</p>
                <p className="text-lg font-bold">${totalPipeline.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Weighted</p>
                <p className="text-lg font-bold">${Math.round(weightedPipeline).toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Oportunidad
          </Button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar oportunidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los owners</SelectItem>
                {teamMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === "table" ? (
        /* Table View */
        <Card>
          <CardHeader className="p-8 pb-0">
            <CardTitle>Lista de Oportunidades</CardTitle>
            <CardDescription>{activeOpps.length} oportunidades activas</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.terminology.entity}</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Probabilidad</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Próximo paso</TableHead>
                  <TableHead className="text-right">Cerrar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOpps.map((opp) => (
                  <TableRow key={opp.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={() => handleRowClick(opp)}>
                      <div>
                        <p className="font-medium">{getAccountName(opp.account_id)}</p>
                        <p className="text-sm text-muted-foreground">{getAccountCity(opp.account_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(opp)}>
                      <Badge variant="secondary">{opp.product}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={opp.stage} onValueChange={(v) => handleStageChange(opp.id, v)}>
                        <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discovery">Discovery</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="propuesta">Propuesta</SelectItem>
                          <SelectItem value="negociacion">Negociación</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(opp)}>{getOwnerName(opp.account_id)}</TableCell>
                    <TableCell onClick={() => handleRowClick(opp)}>
                      <Badge
                        variant={opp.probability >= 50 ? "default" : "secondary"}
                        className={opp.probability >= 50 ? "bg-emerald-600" : ""}
                      >
                        {opp.probability}%
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(opp)} className="font-medium">
                      ${opp.mrr.toLocaleString()}
                    </TableCell>
                    <TableCell onClick={() => handleRowClick(opp)}>
                      <span className="text-sm">{opp.next_step}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenCloseDialog(opp, "won")
                          }}
                          title="Marcar como ganada"
                        >
                          <Trophy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenCloseDialog(opp, "lost")
                          }}
                          title="Marcar como perdida"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {activeOpps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay oportunidades activas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Kanban View */
        <KanbanBoard
          opportunities={activeOpps}
          accounts={accounts}
          onOpportunityClick={(opp) => {
            const account = accounts.find((a) => a.id === opp.account_id)
            if (account) {
              setSelectedAccount(account)
              setSheetOpen(true)
            }
          }}
          onRefresh={loadData}
        />
      )}

      <EntitySheet account={selectedAccount as any} open={sheetOpen} onOpenChange={setSheetOpen} onRefresh={loadData} />

      <CreateOpportunityDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        countryCode={country}
        onSuccess={loadData}
      />

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={closeType === "won" ? "text-green-700" : "text-red-700"}>
              {closeType === "won" ? "🏆 Marcar como Ganada" : "Marcar como Perdida"}
            </DialogTitle>
            <DialogDescription>
              {closingOpp && `${getAccountName(closingOpp.account_id)} - $${closingOpp.mrr.toLocaleString()} MRR`}
            </DialogDescription>
          </DialogHeader>

          {closeType === "lost" && (
            <div className="py-4 space-y-2">
              <Label>Razón de pérdida</Label>
              <Select value={lostReason} onValueChange={setLostReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una razón..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presupuesto">Sin presupuesto</SelectItem>
                  <SelectItem value="competencia">Eligieron competencia</SelectItem>
                  <SelectItem value="timing">Timing no adecuado</SelectItem>
                  <SelectItem value="decision">No hay decisión</SelectItem>
                  <SelectItem value="producto">Producto no encaja</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {closeType === "won" && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Esta oportunidad será marcada como ganada y la cuenta pasará a estado "Won".
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCloseOpportunity}
              disabled={isPending || (closeType === "lost" && !lostReason)}
              className={closeType === "won" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {closeType === "won" ? "Confirmar Ganada" : "Confirmar Perdida"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
