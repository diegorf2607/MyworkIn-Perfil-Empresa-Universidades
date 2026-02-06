"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { EntitySheet } from "@/components/crm/entity-sheet"
import { PromoteToSQLDialog } from "@/components/crm/promote-to-sql-dialog"
import { Search, Filter, SortAsc, DollarSign, Loader2, ArrowUpRight, Trophy, XCircle } from "lucide-react"
import { getAccountsByStage, updateAccount } from "@/lib/actions/accounts"
import { createOpportunity } from "@/lib/actions/opportunities"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"
import { useWorkspace } from "@/lib/context/workspace-context"

interface Account {
  id: string
  country_code: string
  name: string
  city: string | null
  type: "privada" | "pública" | null
  owner_id: string | null
  icp_fit: number | null
  probability: number | null
  mrr: number | null
  next_action: string | null
}

interface TeamMember {
  id: string
  name: string
}

export default function SQLsPage() {
  const { country } = useParams<{ country: string }>()
  const { workspace, config } = useWorkspace()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("probability")

  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closeType, setCloseType] = useState<"won" | "lost">("won")
  const [accountToClose, setAccountToClose] = useState<Account | null>(null)
  const [lostReason, setLostReason] = useState<string>("timing")
  const [closeMrr, setCloseMrr] = useState<string>("")
  const [isClosing, setIsClosing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [accountsData, teamData] = await Promise.all([getAccountsByStage(country, "sql", workspace), getTeamMembers()])
      setAccounts((accountsData as Account[]) || [])
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

  const sqls = useMemo(() => {
    let filtered = [...accounts]

    if (searchQuery) {
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (filterOwner !== "all") {
      filtered = filtered.filter((a) => a.owner_id === filterOwner)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "probability":
          return (b.probability || 0) - (a.probability || 0)
        case "mrr":
          return (b.mrr || 0) - (a.mrr || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [accounts, searchQuery, filterOwner, sortBy])

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account)
    setSheetOpen(true)
  }

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === ownerId)
    return member?.name || "Sin asignar"
  }

  const handleOpenCloseDialog = (account: Account, type: "won" | "lost", e: React.MouseEvent) => {
    e.stopPropagation()
    setAccountToClose(account)
    setCloseType(type)
    setCloseMrr(String(account.mrr || 5000))
    setLostReason("timing")
    setCloseDialogOpen(true)
  }

  const handleCloseSQL = async () => {
    if (!accountToClose) return

    setIsClosing(true)
    try {
      // Create an opportunity with won/lost stage
      await createOpportunity({
        country_code: country.toUpperCase(),
        account_id: accountToClose.id,
        product: "MyWorkIn (integral)",
        stage: closeType,
        mrr: Number.parseInt(closeMrr) || 0,
        probability: closeType === "won" ? 100 : 0,
        next_step: closeType === "won" ? "Onboarding" : "Cerrado",
        lost_reason: closeType === "lost" ? lostReason : null,
        closed_at: new Date().toISOString(),
        workspace_id: workspace,
      })

      // Update account stage
      await updateAccount({
        id: accountToClose.id,
        stage: closeType,
      })

      toast.success(closeType === "won" ? "SQL cerrado como Ganado" : "SQL cerrado como Perdido")
      setCloseDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error closing SQL:", error)
      toast.error("Error al cerrar el SQL")
    } finally {
      setIsClosing(false)
    }
  }

  const totalMrr = sqls.reduce((sum, s) => sum + (s.mrr || 0), 0)

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
          <h1 className="text-2xl font-bold">SQLs</h1>
          <p className="text-muted-foreground">Sales Qualified Leads listos para avanzar</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">MRR Estimado</p>
                <p className="text-lg font-bold">${totalMrr.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => setPromoteDialogOpen(true)} className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Promover Lead a SQL
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar SQL..."
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="probability">Probabilidad (mayor)</SelectItem>
              <SelectItem value="mrr">MRR (mayor)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Lista de SQLs</CardTitle>
          <CardDescription>{sqls.length} SQLs encontrados</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{config.terminology.entity}</TableHead>
                <TableHead>{config.terminology.typeLabel}</TableHead>
                <TableHead>ICP Fit</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Probabilidad</TableHead>
                <TableHead>MRR Estimado</TableHead>
                <TableHead>Próxima acción</TableHead>
                <TableHead className="text-right">Cerrar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sqls.map((sql) => (
                <TableRow key={sql.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(sql)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sql.name}</p>
                      <p className="text-sm text-muted-foreground">{sql.city}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sql.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${sql.icp_fit || 0}%` }} />
                      </div>
                      <span className="text-sm">{sql.icp_fit || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getOwnerName(sql.owner_id)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={(sql.probability || 0) >= 50 ? "default" : "secondary"}
                      className={(sql.probability || 0) >= 50 ? "bg-green-600" : ""}
                    >
                      {sql.probability || 0}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">${(sql.mrr || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-sm">{sql.next_action}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => handleOpenCloseDialog(sql, "won", e)}
                        title="Marcar como Ganado"
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleOpenCloseDialog(sql, "lost", e)}
                        title="Marcar como Perdido"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sqls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay SQLs para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EntitySheet account={selectedAccount as any} open={sheetOpen} onOpenChange={setSheetOpen} onRefresh={loadData} />

      <PromoteToSQLDialog
        open={promoteDialogOpen}
        onOpenChange={setPromoteDialogOpen}
        countryCode={country}
        onSuccess={loadData}
      />

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={closeType === "won" ? "text-green-700" : "text-red-700"}>
              {closeType === "won" ? "Cerrar como Ganado" : "Cerrar como Perdido"}
            </DialogTitle>
            <DialogDescription>
              {closeType === "won"
                ? `Confirma el cierre exitoso de ${accountToClose?.name}`
                : `Registra la pérdida de ${accountToClose?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>MRR {closeType === "won" ? "Cerrado" : "Potencial"} ($)</Label>
              <Input type="number" value={closeMrr} onChange={(e) => setCloseMrr(e.target.value)} placeholder="5000" />
            </div>

            {closeType === "lost" && (
              <div className="space-y-2">
                <Label>Razón de pérdida</Label>
                <Select value={lostReason} onValueChange={setLostReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timing">Timing - No es el momento</SelectItem>
                    <SelectItem value="budget">Presupuesto - No tienen recursos</SelectItem>
                    <SelectItem value="competition">Competencia - Eligieron otro</SelectItem>
                    <SelectItem value="no_response">Sin respuesta - Ghostearon</SelectItem>
                    <SelectItem value="not_qualified">No calificado - No era fit</SelectItem>
                    <SelectItem value="other">Otro motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCloseSQL}
              disabled={isClosing}
              className={closeType === "won" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : closeType === "won" ? (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Confirmar Ganado
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Confirmar Perdido
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
