"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, useTransition, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Search, Filter, SortAsc, Building2, Plus, Upload, Loader2 } from "lucide-react"
import { getAccounts, createAccount } from "@/lib/actions/accounts"
import { getContacts } from "@/lib/actions/contacts"
import { getTeamMembers } from "@/lib/actions/team"
import { toast } from "sonner"

interface Account {
  id: string
  country_code: string
  name: string
  city: string | null
  type: string | null
  size: string | null
  stage: string | null
  icp_fit: number | null
  owner_id: string | null
}

interface TeamMember {
  id: string
  name: string
}

interface Contact {
  id: string
  account_id: string
}

export default function UniversitiesPage() {
  const { country } = useParams<{ country: string }>()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStage, setFilterStage] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  const [newUniversity, setNewUniversity] = useState({
    name: "",
    city: "",
    type: "privada" as "privada" | "pública",
    size: "mediana" as "pequeña" | "mediana" | "grande",
  })

  const loadData = useCallback(async () => {
    try {
      const [accountsData, teamData, contactsData] = await Promise.all([
        getAccounts(country),
        getTeamMembers(),
        getContacts(),
      ])
      setAccounts((accountsData || []) as Account[])
      setTeamMembers(teamData || [])
      setContacts((contactsData || []) as Contact[])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  const countryAccounts = useMemo(() => {
    let filtered = [...accounts]

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.city && a.city.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((a) => a.type === filterType)
    }

    if (filterStage !== "all") {
      filtered = filtered.filter((a) => a.stage === filterStage)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "city":
          return (a.city || "").localeCompare(b.city || "")
        case "icpFit":
          return (b.icp_fit || 0) - (a.icp_fit || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [accounts, searchQuery, filterType, filterStage, sortBy])

  const handleRowClick = (account: Account) => {
    setSelectedAccount(account)
    setSheetOpen(true)
  }

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return "Sin asignar"
    const member = teamMembers.find((m) => m.id === ownerId)
    return member?.name || "Sin asignar"
  }

  const getContactsCount = (accountId: string) => {
    return contacts.filter((c) => c.account_id === accountId).length
  }

  const getStageBadge = (stage: string | null) => {
    const colors: Record<string, string> = {
      lead: "bg-blue-100 text-blue-700",
      sql: "bg-purple-100 text-purple-700",
      opp: "bg-orange-100 text-orange-700",
      won: "bg-green-100 text-green-700",
      lost: "bg-red-100 text-red-700",
    }
    return <Badge className={colors[stage || "lead"] || ""}>{(stage || "lead").toUpperCase()}</Badge>
  }

  const handleCreateUniversity = () => {
    if (!newUniversity.name) {
      toast.error("El nombre es requerido")
      return
    }

    startTransition(async () => {
      try {
        await createAccount({
          country_code: country,
          name: newUniversity.name,
          city: newUniversity.city || undefined,
          type: newUniversity.type,
          size: newUniversity.size,
          stage: "lead",
          icp_fit: 50,
        })
        toast.success("Universidad creada")
        setCreateDialogOpen(false)
        setNewUniversity({ name: "", city: "", type: "privada", size: "mediana" })
        loadData()
      } catch (error) {
        toast.error("Error al crear universidad")
        console.error(error)
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          toast.error("El archivo debe tener al menos un encabezado y una fila de datos")
          return
        }

        const header = lines[0].toLowerCase()
        const headers = header.split(/[,;\t]/).map((h) => h.trim().replace(/"/g, ""))

        // Find the "Universidad" column (flexible matching)
        const uniColumnIndex = headers.findIndex(
          (h) => h === "universidad" || h === "university" || h === "nombre" || h === "name",
        )
        const cityColumnIndex = headers.findIndex((h) => h === "ciudad" || h === "city")

        if (uniColumnIndex === -1) {
          toast.error('No se encontró la columna "Universidad". Asegúrate de que el archivo tenga esa columna.')
          return
        }

        const universities: string[] = []
        const cities: (string | null)[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/[,;\t]/).map((v) => v.trim().replace(/"/g, ""))
          const name = values[uniColumnIndex]
          const city = cityColumnIndex !== -1 ? values[cityColumnIndex] : null

          if (name && name.length > 0) {
            universities.push(name)
            cities.push(city || null)
          }
        }

        if (universities.length === 0) {
          toast.error("No se encontraron universidades válidas en el archivo")
          return
        }

        // Create universities in batch
        startTransition(async () => {
          let created = 0
          let errors = 0

          for (let i = 0; i < universities.length; i++) {
            try {
              await createAccount({
                country_code: country,
                name: universities[i],
                city: cities[i] || undefined,
                type: "privada",
                size: "mediana",
                stage: "lead",
                icp_fit: 50,
              })
              created++
            } catch (error) {
              errors++
              console.error(`Error creating ${universities[i]}:`, error)
            }
          }

          toast.success(`${created} universidades creadas${errors > 0 ? `, ${errors} errores` : ""}`)
          setUploadDialogOpen(false)
          loadData()
        })
      } catch (error) {
        toast.error("Error al procesar el archivo")
        console.error(error)
      }
    }

    reader.readAsText(file)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
          <h1 className="text-2xl font-bold">Base de Universidades</h1>
          <p className="text-muted-foreground">Tabla maestra de todas las cuentas del país</p>
        </div>
        <div className="flex items-center gap-2">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{countryAccounts.length}</p>
              </div>
            </div>
          </Card>
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Subir CSV
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar universidad o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="privada">Privada</SelectItem>
              <SelectItem value="pública">Pública</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="opp">Oportunidad</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre A-Z</SelectItem>
              <SelectItem value="city">Ciudad</SelectItem>
              <SelectItem value="icpFit">ICP Fit</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Universidades</CardTitle>
          <CardDescription>{countryAccounts.length} universidades</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Universidad</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>ICP Fit</TableHead>
                <TableHead>Contactos</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countryAccounts.map((acc) => (
                <TableRow key={acc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(acc)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{acc.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{acc.city || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{acc.type || "privada"}</Badge>
                  </TableCell>
                  <TableCell>{acc.size || "mediana"}</TableCell>
                  <TableCell>{getStageBadge(acc.stage)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${acc.icp_fit || 0}%` }} />
                      </div>
                      <span className="text-sm">{acc.icp_fit || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getContactsCount(acc.id)}</Badge>
                  </TableCell>
                  <TableCell>{getOwnerName(acc.owner_id)}</TableCell>
                </TableRow>
              ))}
              {countryAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay universidades
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EntitySheet account={selectedAccount as any} open={sheetOpen} onOpenChange={setSheetOpen} onRefresh={loadData} />

      {/* Create University Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Universidad</DialogTitle>
            <DialogDescription>Crea una nueva universidad manualmente</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newUniversity.name}
                onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                placeholder="Universidad Nacional..."
              />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input
                value={newUniversity.city}
                onChange={(e) => setNewUniversity({ ...newUniversity, city: e.target.value })}
                placeholder="Ciudad de México..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newUniversity.type}
                  onValueChange={(v) => setNewUniversity({ ...newUniversity, type: v as "privada" | "pública" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privada">Privada</SelectItem>
                    <SelectItem value="pública">Pública</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tamaño</Label>
                <Select
                  value={newUniversity.size}
                  onValueChange={(v) =>
                    setNewUniversity({ ...newUniversity, size: v as "pequeña" | "mediana" | "grande" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeña">Pequeña</SelectItem>
                    <SelectItem value="mediana">Mediana</SelectItem>
                    <SelectItem value="grande">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUniversity} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Universidades desde CSV</DialogTitle>
            <DialogDescription>
              El archivo debe tener una columna llamada "Universidad" con los nombres. Opcionalmente puede incluir
              "Ciudad".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">Selecciona un archivo CSV o Excel (.csv, .txt)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Seleccionar archivo"
                )}
              </Button>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">Formato esperado:</p>
              <code className="text-xs">Universidad,Ciudad</code>
              <br />
              <code className="text-xs">Universidad Nacional,Lima</code>
              <br />
              <code className="text-xs">PUCP,Lima</code>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
