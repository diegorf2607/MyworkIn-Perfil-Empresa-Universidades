"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EntitySheet } from "@/components/crm/entity-sheet"
import { CreateAccountDialog } from "@/components/crm/create-account-dialog"
import { Search, Filter, SortAsc, Loader2, Plus } from "lucide-react"
import { getAccountsByStage } from "@/lib/actions/accounts"
import { getTeamMembers } from "@/lib/actions/team"
import { useWorkspace } from "@/lib/context/workspace-context"

interface Account {
  id: string
  country_code: string
  name: string
  city: string | null
  type: "privada" | "pública" | null
  website: string | null
  size: "pequeña" | "mediana" | "grande" | null
  owner_id: string | null
  fit_comercial: "alto" | "medio" | "bajo" | null
  stage: "lead" | "sql" | "opp" | "won" | "lost" | null
  source: "inbound" | "outbound" | "referral" | "evento" | null
  last_touch: string | null
  next_action: string | null
  next_action_date: string | null
  probability: number | null
  mrr: number | null
  status: "activo" | "pausado" | "archivado" | null
  notes: string | null
  created_at: string
  contacts?: unknown[]
  opportunities?: unknown[]
  activities?: unknown[]
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: "SDR" | "AE"
  country_code: string | null
}

const getFitBadge = (fit: string | null) => {
  const config: Record<string, { label: string; className: string }> = {
    alto: { label: "Alto", className: "bg-green-100 text-green-700" },
    medio: { label: "Medio", className: "bg-yellow-100 text-yellow-700" },
    bajo: { label: "Bajo", className: "bg-red-100 text-red-700" },
  }
  const fitConfig = config[fit || "medio"] || config.medio
  return <Badge className={fitConfig.className}>{fitConfig.label}</Badge>
}

export default function LeadsPage() {
  const { country } = useParams<{ country: string }>()
  const { workspace } = useWorkspace()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [filterSource, setFilterSource] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  const loadData = useCallback(async () => {
    try {
      const [accountsData, teamData] = await Promise.all([getAccountsByStage(country, "lead", workspace), getTeamMembers()])
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

  const leads = useMemo(() => {
    let filtered = [...accounts]

    if (searchQuery) {
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (filterOwner !== "all") {
      filtered = filtered.filter((a) => a.owner_id === filterOwner)
    }

    if (filterSource !== "all") {
      filtered = filtered.filter((a) => a.source === filterSource)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "fit":
          const fitOrder = { alto: 3, medio: 2, bajo: 1 }
          return (fitOrder[b.fit_comercial || "medio"] || 2) - (fitOrder[a.fit_comercial || "medio"] || 2)
        case "lastTouch":
          return new Date(b.last_touch || 0).getTime() - new Date(a.last_touch || 0).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [accounts, searchQuery, filterOwner, filterSource, sortBy])

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account)
    setSheetOpen(true)
  }

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === ownerId)
    return member?.name || "Sin asignar"
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
          <h1 className="text-2xl font-bold">Leads (ICP)</h1>
          <p className="text-muted-foreground">Universidades que encajan con nuestro cliente ideal</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Lead ICP
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar universidad..."
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
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="fit">Fit Comercial (mayor)</SelectItem>
              <SelectItem value="lastTouch">Último contacto</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>{leads.length} leads encontrados</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Universidad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fit Comercial</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Último contacto</TableHead>
                <TableHead>Próxima acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(lead)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.city}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.type}</Badge>
                  </TableCell>
                  <TableCell>{getFitBadge(lead.fit_comercial)}</TableCell>
                  <TableCell>{getOwnerName(lead.owner_id)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>{lead.last_touch ? new Date(lead.last_touch).toLocaleDateString("es-ES") : "-"}</TableCell>
                  <TableCell>
                    <span className="text-sm">{lead.next_action}</span>
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay leads para mostrar
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EntitySheet account={selectedAccount} open={sheetOpen} onOpenChange={setSheetOpen} onRefresh={loadData} />
      <CreateAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        countryCode={country}
        defaultStage="lead"
        onSuccess={loadData}
      />
    </div>
  )
}
