"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { EntitySheet } from "@/components/crm/entity-sheet"
import { Search, Trophy, XCircle, Loader2 } from "lucide-react"
import { getOpportunities, createOpportunity } from "@/lib/actions/opportunities"
import { getAccounts, updateAccount } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"

interface Opportunity {
  id: string
  country_code: string
  account_id: string
  product: string
  stage: string
  mrr: number
  lost_reason: string | null
  closed_at: string | null
}

interface Account {
  id: string
  name: string
  city: string | null
  type: string | null
  owner_id: string | null
  stage: string
}

interface TeamMember {
  id: string
  name: string
}

const LOST_REASONS = [
  { value: "timing", label: "No es el momento" },
  { value: "budget", label: "Sin presupuesto" },
  { value: "competitor", label: "Eligió competencia" },
  { value: "no_response", label: "No responde" },
  { value: "not_interested", label: "No interesado" },
  { value: "other", label: "Otro" },
]

export default function ClosedPage() {
  const { country } = useParams<{ country: string }>()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("won")

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [registerType, setRegisterType] = useState<"won" | "lost">("won")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [mrr, setMrr] = useState("5000")
  const [lostReason, setLostReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [oppsData, accountsData, teamData] = await Promise.all([
        getOpportunities(country),
        getAccounts(country),
        getTeamMembers(),
      ])

      const closedOpps = (oppsData || []).filter((o) => o.stage === "won" || o.stage === "lost")

      setOpportunities(closedOpps as Opportunity[])
      setAccounts((accountsData || []) as Account[])
      setTeamMembers(teamData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  const availableAccounts = useMemo(() => {
    const closedAccountIds = opportunities.map((o) => o.account_id)
    return accounts.filter(
      (a) => !closedAccountIds.includes(a.id) && (a.stage === "lead" || a.stage === "sql" || a.stage === "opp"),
    )
  }, [accounts, opportunities])

  const filteredOpps = useMemo(() => {
    if (!searchQuery) return opportunities
    const query = searchQuery.toLowerCase()
    return opportunities.filter((o) => {
      const account = accounts.find((a) => a.id === o.account_id)
      return account?.name.toLowerCase().includes(query)
    })
  }, [opportunities, searchQuery, accounts])

  const wonOpps = filteredOpps.filter((o) => o.stage === "won")
  const lostOpps = filteredOpps.filter((o) => o.stage === "lost")

  const totalWonMrr = wonOpps.reduce((sum, o) => sum + (o.mrr || 0), 0)

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Sin asignar"
  }

  const getAccountCity = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.city || ""
  }

  const getAccountType = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.type || "privada"
  }

  const handleRowClick = (opp: Opportunity) => {
    const account = accounts.find((a) => a.id === opp.account_id)
    if (account) {
      setSelectedAccount(account)
      setSheetOpen(true)
    }
  }

  const getOwnerName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account?.owner_id) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === account.owner_id)
    return member?.name || "Sin asignar"
  }

  const openRegisterDialog = (type: "won" | "lost") => {
    setRegisterType(type)
    setSelectedAccountId("")
    setMrr("5000")
    setLostReason("")
    setRegisterDialogOpen(true)
  }

  const handleRegister = async () => {
    if (!selectedAccountId) return

    setIsSubmitting(true)
    try {
      await createOpportunity({
        country_code: country,
        account_id: selectedAccountId,
        product: "MyWorkIn (integral)",
        stage: registerType,
        mrr: Number.parseInt(mrr) || 0,
        probability: registerType === "won" ? 100 : 0,
        lost_reason: registerType === "lost" ? lostReason : null,
        closed_at: new Date().toISOString(),
      })

      await updateAccount({
        id: selectedAccountId,
        stage: registerType,
      })

      setRegisterDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error registering:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="text-2xl font-bold">Cerradas</h1>
          <p className="text-muted-foreground">Oportunidades ganadas y perdidas</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => openRegisterDialog("won")} className="bg-green-600 hover:bg-green-700">
            <Trophy className="mr-2 h-4 w-4" />
            Registrar Won
          </Button>
          <Button onClick={() => openRegisterDialog("lost")} variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Registrar Lost
          </Button>
          <Card className="px-4 py-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Won ({wonOpps.length})</p>
                <p className="text-lg font-bold text-green-700">${totalWonMrr.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="px-4 py-2 border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Lost</p>
                <p className="text-lg font-bold text-red-700">{lostOpps.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="won" className="gap-2">
            <Trophy className="h-4 w-4" />
            Ganadas ({wonOpps.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="gap-2">
            <XCircle className="h-4 w-4" />
            Perdidas ({lostOpps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="won">
          <Card>
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-green-700">Oportunidades Ganadas</CardTitle>
              <CardDescription>Clientes cerrados exitosamente</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Universidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Fecha cierre</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wonOpps.map((opp) => (
                    <TableRow
                      key={opp.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(opp)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{getAccountName(opp.account_id)}</p>
                          <p className="text-sm text-muted-foreground">{getAccountCity(opp.account_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAccountType(opp.account_id)}</Badge>
                      </TableCell>
                      <TableCell>{getOwnerName(opp.account_id)}</TableCell>
                      <TableCell className="font-medium text-green-600">${(opp.mrr || 0).toLocaleString()}</TableCell>
                      <TableCell>{opp.closed_at ? new Date(opp.closed_at).toLocaleDateString("es-ES") : "-"}</TableCell>
                    </TableRow>
                  ))}
                  {wonOpps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay oportunidades ganadas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lost">
          <Card>
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-red-700">Oportunidades Perdidas</CardTitle>
              <CardDescription>Análisis de deals perdidos</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Universidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>MRR Potencial</TableHead>
                    <TableHead>Razón</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lostOpps.map((opp) => (
                    <TableRow
                      key={opp.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(opp)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{getAccountName(opp.account_id)}</p>
                          <p className="text-sm text-muted-foreground">{getAccountCity(opp.account_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAccountType(opp.account_id)}</Badge>
                      </TableCell>
                      <TableCell>{getOwnerName(opp.account_id)}</TableCell>
                      <TableCell className="text-muted-foreground">${(opp.mrr || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{opp.lost_reason || "Sin especificar"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lostOpps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay oportunidades perdidas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EntitySheet account={selectedAccount as any} open={sheetOpen} onOpenChange={setSheetOpen} onRefresh={loadData} />

      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={registerType === "won" ? "text-green-700" : "text-red-700"}>
              {registerType === "won" ? "Registrar Universidad Ganada" : "Registrar Universidad Perdida"}
            </DialogTitle>
            <DialogDescription>
              Selecciona una universidad existente para marcarla como {registerType === "won" ? "ganada" : "perdida"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Universidad *</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona universidad..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No hay universidades disponibles
                    </SelectItem>
                  ) : (
                    availableAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span>{account.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {account.stage.toUpperCase()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>MRR ($)</Label>
              <Input type="number" value={mrr} onChange={(e) => setMrr(e.target.value)} placeholder="5000" />
            </div>

            {registerType === "lost" && (
              <div className="space-y-2">
                <Label>Razón de pérdida</Label>
                <Select value={lostReason} onValueChange={setLostReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona razón..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LOST_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegister}
              disabled={!selectedAccountId || isSubmitting}
              className={registerType === "won" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={registerType === "lost" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : registerType === "won" ? (
                <Trophy className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {registerType === "won" ? "Registrar Ganada" : "Registrar Perdida"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
