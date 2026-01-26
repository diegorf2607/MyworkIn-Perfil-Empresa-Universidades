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
import { ScrollArea } from "@/components/ui/scroll-area"
import { EntitySheet } from "@/components/crm/entity-sheet"
import { Search, Filter, SortAsc, Building2, Plus, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { getAccounts, createAccount, updateAccount } from "@/lib/actions/accounts"
import { getContacts } from "@/lib/actions/contacts"
import { getTeamMembers } from "@/lib/actions/team"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Account {
  id: string
  country_code: string
  name: string
  city: string | null
  type: string | null
  size: string | null
  stage: string | null
  fit_comercial: string | null
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

  const [importResults, setImportResults] = useState<{
    created: number
    updated: number
    errors: { row: number; name: string; message: string }[]
  } | null>(null)
  const [csvPreview, setCsvPreview] = useState<{
    valid: { name: string; city: string; type: string; size: string }[]
    errors: { row: number; name: string; message: string }[]
  } | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)

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
        case "fit":
          const fitOrder: Record<string, number> = { alto: 3, medio: 2, bajo: 1 }
          return (fitOrder[b.fit_comercial || "medio"] || 2) - (fitOrder[a.fit_comercial || "medio"] || 2)
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
          fit_comercial: "medio",
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

  const normalizeType = (value: string): string | null => {
    const normalized = value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents

    if (normalized === "privada" || normalized === "private") return "privada"
    if (normalized === "publica" || normalized === "public" || normalized === "pública") return "pública"
    return null
  }

  const normalizeSize = (value: string): string | null => {
    const normalized = value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents

    if (normalized === "pequena" || normalized === "pequeña" || normalized === "small") return "pequeña"
    if (normalized === "mediana" || normalized === "medium") return "mediana"
    if (normalized === "grande" || normalized === "large") return "grande"
    return null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setImportResults(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          toast.error("El archivo debe tener al menos un encabezado y una fila de datos")
          setCsvPreview(null)
          return
        }

        const header = lines[0].toLowerCase()
        const headers = header.split(/[,;\t]/).map((h) => h.trim().replace(/"/g, ""))

        // Find required columns
        const uniIdx = headers.findIndex(
          (h) => h === "universidad" || h === "university" || h === "nombre" || h === "name",
        )
        const cityIdx = headers.findIndex((h) => h === "ciudad" || h === "city")
        const typeIdx = headers.findIndex((h) => h === "tipo" || h === "type")
        const sizeIdx = headers.findIndex((h) => h === "tamaño" || h === "tamano" || h === "size")

        if (uniIdx === -1) {
          toast.error('Columna "Universidad" no encontrada')
          setCsvPreview(null)
          return
        }

        if (typeIdx === -1) {
          toast.error('Columna "Tipo" no encontrada')
          setCsvPreview(null)
          return
        }

        if (sizeIdx === -1) {
          toast.error('Columna "Tamaño" no encontrada')
          setCsvPreview(null)
          return
        }

        const valid: { name: string; city: string; type: string; size: string }[] = []
        const errors: { row: number; name: string; message: string }[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/[,;\t]/).map((v) => v.trim().replace(/"/g, ""))
          const name = values[uniIdx]?.trim()
          const city = cityIdx !== -1 ? values[cityIdx]?.trim() : ""
          const typeRaw = values[typeIdx]?.trim() || ""
          const sizeRaw = values[sizeIdx]?.trim() || ""

          if (!name) continue // Skip empty rows

          const type = normalizeType(typeRaw)
          const size = normalizeSize(sizeRaw)

          const rowErrors: string[] = []
          if (!type) {
            rowErrors.push(`Tipo "${typeRaw}" inválido (usar: Privada o Pública)`)
          }
          if (!size) {
            rowErrors.push(`Tamaño "${sizeRaw}" inválido (usar: Pequeña, Mediana o Grande)`)
          }

          if (rowErrors.length > 0) {
            errors.push({ row: i + 1, name, message: rowErrors.join("; ") })
          } else {
            valid.push({ name, city, type: type!, size: size! })
          }
        }

        setCsvPreview({ valid, errors })
      } catch (error) {
        toast.error("Error al procesar el archivo")
        console.error(error)
        setCsvPreview(null)
      }
    }

    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImportCSV = async () => {
    if (!csvPreview || csvPreview.valid.length === 0) return

    startTransition(async () => {
      const supabase = createBrowserClient()
      let created = 0
      let updated = 0
      const importErrors: { row: number; name: string; message: string }[] = [...csvPreview.errors]

      for (const uni of csvPreview.valid) {
        try {
          // Check if university already exists in this country
          const { data: existing } = await supabase
            .from("accounts")
            .select("id")
            .eq("country_code", country.toUpperCase())
            .ilike("name", uni.name)
            .single()

          if (existing) {
            // Update existing
            await updateAccount({
              id: existing.id,
              city: uni.city || undefined,
              type: uni.type,
              size: uni.size,
            })
            updated++
          } else {
            // Create new
            await createAccount({
              country_code: country.toUpperCase(),
              name: uni.name,
              city: uni.city || undefined,
              type: uni.type,
              size: uni.size,
              stage: "lead",
              fit_comercial: "medio",
            })
            created++
          }
        } catch (error: any) {
          importErrors.push({
            row: 0,
            name: uni.name,
            message: error?.message || "Error desconocido",
          })
        }
      }

      setImportResults({ created, updated, errors: importErrors })
      toast.success(`Importación completada: ${created} creadas, ${updated} actualizadas`)
      loadData()
    })
  }

  const resetUploadDialog = () => {
    setUploadDialogOpen(false)
    setCsvPreview(null)
    setCsvFile(null)
    setImportResults(null)
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
        <CardContent className="flex flex-wrap items-center gap-4 p-8">
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
              <SelectItem value="fit">Fit Comercial</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Todas las Universidades</CardTitle>
          <CardDescription>{countryAccounts.length} universidades</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Universidad</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Fit Comercial</TableHead>
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
                  <TableCell>{getFitBadge(acc.fit_comercial)}</TableCell>
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

      <Dialog open={uploadDialogOpen} onOpenChange={resetUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir Universidades desde CSV</DialogTitle>
            <DialogDescription>Importa universidades en lote. Las existentes se actualizarán.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Format info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Formato requerido:</p>
              <code className="text-xs block bg-background p-2 rounded">
                Universidad,Ciudad,Tipo,Tamaño
                <br />
                Universidad Nacional,Lima,Pública,Grande
                <br />
                PUCP,Lima,Privada,Mediana
              </code>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>
                  <strong>Tipo:</strong> Privada | Pública
                </p>
                <p>
                  <strong>Tamaño:</strong> Pequeña | Mediana | Grande
                </p>
              </div>
            </div>

            {/* File upload area */}
            {!csvPreview && !importResults && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Selecciona un archivo CSV o Excel (.csv, .txt)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Seleccionar archivo
                </Button>
              </div>
            )}

            {/* Preview results */}
            {csvPreview && !importResults && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">{csvPreview.valid.length} válidas</span>
                  </div>
                  {csvPreview.errors.length > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{csvPreview.errors.length} con errores</span>
                    </div>
                  )}
                </div>

                {/* Valid rows preview */}
                {csvPreview.valid.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Universidades a importar:</p>
                    <ScrollArea className="h-32 border rounded-lg">
                      <div className="p-2 space-y-1">
                        {csvPreview.valid.slice(0, 10).map((uni, i) => (
                          <div key={i} className="text-sm flex gap-2">
                            <span className="font-medium">{uni.name}</span>
                            <span className="text-muted-foreground">
                              {uni.city && `• ${uni.city}`} • {uni.type} • {uni.size}
                            </span>
                          </div>
                        ))}
                        {csvPreview.valid.length > 10 && (
                          <p className="text-xs text-muted-foreground">... y {csvPreview.valid.length - 10} más</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Error rows */}
                {csvPreview.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Filas con errores (no se importarán):</p>
                    <ScrollArea className="h-32 border border-red-200 rounded-lg bg-red-50">
                      <div className="p-2 space-y-1">
                        {csvPreview.errors.map((err, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">
                              Fila {err.row}: {err.name}
                            </span>
                            <span className="text-red-600 ml-2">— {err.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}

            {/* Import results */}
            {importResults && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Importación completada</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{importResults.created}</p>
                      <p className="text-sm text-green-700">Creadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{importResults.updated}</p>
                      <p className="text-sm text-blue-700">Actualizadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
                      <p className="text-sm text-red-700">Errores</p>
                    </div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-2">Errores durante la importación:</p>
                    <ScrollArea className="h-24 border border-red-200 rounded-lg bg-red-50">
                      <div className="p-2 space-y-1">
                        {importResults.errors.map((err, i) => (
                          <div key={i} className="text-sm text-red-700">
                            {err.name}: {err.message}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetUploadDialog}>
              {importResults ? "Cerrar" : "Cancelar"}
            </Button>
            {csvPreview && !importResults && csvPreview.valid.length > 0 && (
              <Button onClick={handleImportCSV} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  `Importar ${csvPreview.valid.length} universidades`
                )}
              </Button>
            )}
            {!csvPreview && !importResults && (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Seleccionar archivo
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
