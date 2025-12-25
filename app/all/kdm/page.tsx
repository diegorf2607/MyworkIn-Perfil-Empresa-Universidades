"use client"

import type React from "react"
import { useState, useEffect, useCallback, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Upload,
  Download,
  Power,
  PowerOff,
  Building2,
  Globe,
  AlertCircle,
  CheckCircle,
  UserCircle,
  Linkedin,
} from "lucide-react"
import { toast } from "sonner"
import {
  getKDMContacts,
  createKDMContact,
  updateKDMContact,
  deleteKDMContact,
  importKDMFromCSV,
  type KDMContact,
} from "@/lib/actions/kdm"
import { getAccounts } from "@/lib/actions/accounts"
import { getCountries } from "@/lib/actions/countries"

interface Account {
  id: string
  name: string
  country_code: string
}

interface Country {
  code: string
  name: string
  flag: string
}

export default function GlobalKDMPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Data
  const [kdmContacts, setKdmContacts] = useState<KDMContact[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const [filterUniversity, setFilterUniversity] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)

  // Dialog states
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingKDM, setEditingKDM] = useState<KDMContact | null>(null)
  const [deleteKDM, setDeleteKDM] = useState<KDMContact | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload")
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importErrors, setImportErrors] = useState<{ row: number; data: any; reason: string }[]>([])
  const [importResult, setImportResult] = useState<{ created: number; updated: number; errors: any[] } | null>(null)
  const [importCountry, setImportCountry] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newKDM, setNewKDM] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_title: "",
    linkedin_url: "",
    referred_by: "", // Added referred_by field
    notes: "",
    account_id: "",
    country_code: "",
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [kdmData, accountsData, countriesData] = await Promise.all([
        getKDMContacts(), // Get all KDMs globally
        getAccounts(),
        getCountries(),
      ])
      setKdmContacts(kdmData)
      setAccounts(accountsData)
      setCountries(countriesData.filter((c: Country) => c.code !== "ALL"))
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Get university name by account_id
  const getUniversityName = (accountId: string | null) => {
    if (!accountId) return "Sin asignar"
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Desconocida"
  }

  // Get country by account_id
  const getCountryByAccount = (accountId: string | null) => {
    if (!accountId) return null
    const account = accounts.find((a) => a.id === accountId)
    return account?.country_code || null
  }

  // Filter logic
  const filteredKDM = kdmContacts.filter((kdm) => {
    const matchesSearch =
      search === "" ||
      `${kdm.first_name} ${kdm.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      kdm.email?.toLowerCase().includes(search.toLowerCase()) ||
      kdm.role_title?.toLowerCase().includes(search.toLowerCase())

    const kdmCountry = getCountryByAccount(kdm.account_id)
    const matchesCountry = filterCountry === "all" || kdmCountry === filterCountry

    const matchesUniversity = filterUniversity === "all" || kdm.account_id === filterUniversity

    const matchesStatus = showInactive || kdm.is_active !== false

    return matchesSearch && matchesCountry && matchesUniversity && matchesStatus
  })

  // Get filtered accounts based on selected country
  const filteredAccounts = filterCountry === "all" ? accounts : accounts.filter((a) => a.country_code === filterCountry)

  // Create new KDM
  const handleCreateKDM = async () => {
    if (!newKDM.first_name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }
    if (!newKDM.country_code) {
      toast.error("Selecciona un país")
      return
    }

    startTransition(async () => {
      try {
        await createKDMContact(
          {
            first_name: newKDM.first_name,
            last_name: newKDM.last_name || undefined,
            email: newKDM.email || undefined,
            phone: newKDM.phone || undefined,
            role_title: newKDM.role_title || undefined,
            linkedin_url: newKDM.linkedin_url || undefined,
            referred_by: newKDM.referred_by || undefined,
            notes: newKDM.notes || undefined,
          },
          newKDM.account_id || undefined,
          newKDM.country_code,
        )
        toast.success("KDM creado exitosamente")
        setIsNewDialogOpen(false)
        setNewKDM({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          role_title: "",
          linkedin_url: "",
          referred_by: "",
          notes: "",
          account_id: "",
          country_code: "",
        })
        loadData()
      } catch (error) {
        console.error("Error creating KDM:", error)
        toast.error("Error al crear KDM")
      }
    })
  }

  // Update KDM
  const handleUpdateKDM = async () => {
    if (!editingKDM) return

    startTransition(async () => {
      try {
        await updateKDMContact({
          id: editingKDM.id,
          first_name: editingKDM.first_name,
          last_name: editingKDM.last_name,
          email: editingKDM.email,
          phone: editingKDM.phone,
          role_title: editingKDM.role_title,
          linkedin_url: editingKDM.linkedin_url,
          referred_by: editingKDM.referred_by, // Added referred_by field
          notes: editingKDM.notes,
          account_id: editingKDM.account_id,
          is_active: editingKDM.is_active,
        })
        toast.success("KDM actualizado")
        setEditingKDM(null)
        loadData()
      } catch (error) {
        console.error("Error updating KDM:", error)
        toast.error("Error al actualizar KDM")
      }
    })
  }

  // Toggle active status
  const handleToggleActive = async (kdm: KDMContact) => {
    startTransition(async () => {
      try {
        await updateKDMContact({
          id: kdm.id,
          is_active: !kdm.is_active,
        })
        toast.success(kdm.is_active ? "KDM desactivado" : "KDM activado")
        loadData()
      } catch (error) {
        toast.error("Error al cambiar estado")
      }
    })
  }

  // Delete KDM
  const handleDeleteKDM = async () => {
    if (!deleteKDM) return

    startTransition(async () => {
      try {
        await deleteKDMContact(deleteKDM.id)
        toast.success("KDM eliminado")
        setDeleteKDM(null)
        loadData()
      } catch (error) {
        toast.error("Error al eliminar KDM")
      }
    })
  }

  // CSV Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!importCountry) {
      toast.error("Selecciona un país antes de importar")
      return
    }

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      toast.error("El archivo está vacío o solo tiene encabezados")
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const nameIdx = headers.findIndex((h) => ["nombre", "name", "nombre completo"].includes(h))
    const cargoIdx = headers.findIndex((h) => ["cargo", "puesto", "titulo", "role", "title"].includes(h))
    const emailIdx = headers.findIndex((h) => ["email", "correo", "e-mail"].includes(h))
    const phoneIdx = headers.findIndex((h) => ["telefono", "teléfono", "phone", "celular", "móvil"].includes(h))
    const uniIdx = headers.findIndex((h) => ["universidad", "university", "institucion", "institución"].includes(h))
    const linkedinIdx = headers.findIndex((h) => ["linkedin", "linkedin_url", "perfil linkedin"].includes(h))
    const referredByIdx = headers.findIndex((h) => ["referred_by", "referido por"].includes(h))

    if (nameIdx === -1) {
      toast.error("Falta columna 'Nombre' en el CSV")
      return
    }

    const validRows: any[] = []
    const errorRows: { row: number; data: any; reason: string }[] = []

    // Build account name to id map for selected country only
    const countryAccounts = accounts.filter((a) => a.country_code === importCountry)
    const accountMap = new Map(countryAccounts.map((a) => [a.name.toLowerCase().trim(), a.id]))

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const fullName = values[nameIdx] || ""
      const nameParts = fullName.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      const cargo = cargoIdx >= 0 ? values[cargoIdx] : ""
      const email = emailIdx >= 0 ? values[emailIdx] : ""
      const phone = phoneIdx >= 0 ? values[phoneIdx] : ""
      const uniName = uniIdx >= 0 ? values[uniIdx] : ""
      const linkedin = linkedinIdx >= 0 ? values[linkedinIdx] : ""
      const referredBy = referredByIdx >= 0 ? values[referredByIdx] : ""

      const rowData = { firstName, lastName, cargo, email, phone, uniName, linkedin, referredBy }

      if (!firstName) {
        errorRows.push({ row: i + 1, data: rowData, reason: "Nombre vacío" })
        continue
      }

      // Validate university exists in selected country
      let accountId: string | undefined
      if (uniName) {
        accountId = accountMap.get(uniName.toLowerCase().trim())
        if (!accountId) {
          errorRows.push({
            row: i + 1,
            data: rowData,
            reason: `Universidad "${uniName}" no encontrada en ${importCountry}`,
          })
          continue
        }
      }

      validRows.push({
        first_name: firstName,
        last_name: lastName,
        role_title: cargo,
        email: email || undefined,
        phone: phone || undefined,
        account_id: accountId,
        linkedin_url: linkedin || undefined,
        referred_by: referredBy || undefined, // Added referred_by field
        country_code: importCountry,
      })
    }

    setImportPreview(validRows)
    setImportErrors(errorRows)
    setImportStep("preview")
  }

  const handleImportConfirm = async () => {
    if (importPreview.length === 0) {
      toast.error("No hay filas válidas para importar")
      return
    }

    startTransition(async () => {
      try {
        const result = await importKDMFromCSV(importPreview)
        setImportResult(result)
        setImportStep("result")
        loadData()
      } catch (error) {
        console.error("Error importing CSV:", error)
        toast.error("Error al importar CSV")
      }
    })
  }

  const resetImport = () => {
    setImportStep("upload")
    setImportPreview([])
    setImportErrors([])
    setImportResult(null)
    setImportCountry("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadTemplate = () => {
    const csv =
      "Nombre,Cargo,Email,Teléfono,Universidad,LinkedIn,Referido por\nJuan Pérez,Rector,juan@uni.edu,+52123456789,UNAM,https://linkedin.com/in/juanperez,Pedro"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_kdm.csv"
    a.click()
  }

  // Get accounts filtered by new KDM country selection
  const accountsForNewKDM = newKDM.country_code ? accounts.filter((a) => a.country_code === newKDM.country_code) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            KDM Global
          </h1>
          <p className="text-muted-foreground">Tomadores de decisión de todos los países</p>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">
          <UserCircle className="h-4 w-4 mr-1" />
          {filteredKDM.length} KDM{filteredKDM.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterUniversity} onValueChange={setFilterUniversity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Universidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filteredAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
              <Label htmlFor="show-inactive" className="text-sm">
                Inactivos
              </Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Subir CSV
              </Button>
              <Button onClick={() => setIsNewDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo KDM
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los KDM</CardTitle>
          <CardDescription>Contactos clave para la toma de decisiones</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredKDM.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay KDMs registrados</p>
              <p className="text-sm mt-1">Crea uno nuevo o importa desde CSV</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>País</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Universidad</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKDM.map((kdm) => {
                  const kdmCountry = getCountryByAccount(kdm.account_id)
                  const country = countries.find((c) => c.code === kdmCountry)
                  return (
                    <TableRow key={kdm.id} className={!kdm.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        {country ? (
                          <span>
                            {country.flag} {country.code}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {kdm.first_name} {kdm.last_name}
                          </p>
                          {kdm.linkedin_url && (
                            <a
                              href={kdm.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Linkedin className="h-3 w-3" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {getUniversityName(kdm.account_id)}
                        </div>
                      </TableCell>
                      <TableCell>{kdm.role_title || "-"}</TableCell>
                      <TableCell>
                        {kdm.email ? (
                          <a href={`mailto:${kdm.email}`} className="text-primary hover:underline">
                            {kdm.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{kdm.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={kdm.is_active ? "default" : "secondary"}>
                          {kdm.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditingKDM(kdm)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(kdm)}>
                            {kdm.is_active ? (
                              <PowerOff className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteKDM(kdm)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New KDM Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Nuevo KDM
            </DialogTitle>
            <DialogDescription>Agrega un nuevo tomador de decisión</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>País *</Label>
              <Select
                value={newKDM.country_code}
                onValueChange={(v) => setNewKDM({ ...newKDM, country_code: v, account_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar país..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={newKDM.first_name}
                  onChange={(e) => setNewKDM({ ...newKDM, first_name: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input
                  value={newKDM.last_name}
                  onChange={(e) => setNewKDM({ ...newKDM, last_name: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Universidad</Label>
              <Select
                value={newKDM.account_id}
                onValueChange={(v) => setNewKDM({ ...newKDM, account_id: v })}
                disabled={!newKDM.country_code}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={newKDM.country_code ? "Seleccionar universidad..." : "Primero selecciona país"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {accountsForNewKDM.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={newKDM.role_title}
                onChange={(e) => setNewKDM({ ...newKDM, role_title: e.target.value })}
                placeholder="Rector, Director de TI, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newKDM.email}
                  onChange={(e) => setNewKDM({ ...newKDM, email: e.target.value })}
                  placeholder="correo@universidad.edu"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={newKDM.phone}
                  onChange={(e) => setNewKDM({ ...newKDM, phone: e.target.value })}
                  placeholder="+52 123 456 7890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={newKDM.linkedin_url}
                onChange={(e) => setNewKDM({ ...newKDM, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/perfil"
              />
            </div>
            <div className="space-y-2">
              <Label>Referido por</Label>
              <Input
                value={newKDM.referred_by}
                onChange={(e) => setNewKDM({ ...newKDM, referred_by: e.target.value })}
                placeholder="Nombre de quien te pasó el contacto"
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={newKDM.notes}
                onChange={(e) => setNewKDM({ ...newKDM, notes: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateKDM} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear KDM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit KDM Dialog */}
      <Dialog open={!!editingKDM} onOpenChange={(open) => !open && setEditingKDM(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar KDM</DialogTitle>
          </DialogHeader>
          {editingKDM && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={editingKDM.first_name}
                    onChange={(e) => setEditingKDM({ ...editingKDM, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={editingKDM.last_name || ""}
                    onChange={(e) => setEditingKDM({ ...editingKDM, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Universidad</Label>
                <Select
                  value={editingKDM.account_id || ""}
                  onValueChange={(v) => setEditingKDM({ ...editingKDM, account_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar universidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={editingKDM.role_title || ""}
                  onChange={(e) => setEditingKDM({ ...editingKDM, role_title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingKDM.email || ""}
                    onChange={(e) => setEditingKDM({ ...editingKDM, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editingKDM.phone || ""}
                    onChange={(e) => setEditingKDM({ ...editingKDM, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={editingKDM.linkedin_url || ""}
                  onChange={(e) => setEditingKDM({ ...editingKDM, linkedin_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Referido por</Label>
                <Input
                  value={editingKDM.referred_by || ""}
                  onChange={(e) => setEditingKDM({ ...editingKDM, referred_by: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  value={editingKDM.notes || ""}
                  onChange={(e) => setEditingKDM({ ...editingKDM, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingKDM.is_active}
                  onCheckedChange={(checked) => setEditingKDM({ ...editingKDM, is_active: checked })}
                />
                <Label>Activo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKDM(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateKDM} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteKDM} onOpenChange={(open) => !open && setDeleteKDM(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar KDM</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {deleteKDM?.first_name} {deleteKDM?.last_name}? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteKDM(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteKDM} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open)
          if (!open) resetImport()
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir KDMs desde CSV
            </DialogTitle>
            <DialogDescription>Importa tomadores de decisión en lote</DialogDescription>
          </DialogHeader>

          {importStep === "upload" && (
            <div className="space-y-4 py-4">
              {/* Country selection for global import */}
              <div className="space-y-2">
                <Label>País para importar *</Label>
                <Select value={importCountry} onValueChange={setImportCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar país..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Las universidades del CSV deben existir en este país</p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Formato requerido:</p>
                <div className="bg-background p-3 rounded text-xs font-mono space-y-1">
                  <p className="text-foreground">Nombre,Cargo,Email,Teléfono,Universidad,LinkedIn,Referido</p>
                  <p className="text-muted-foreground">
                    Juan Pérez,Rector,juan@uni.edu,+5212345678,UNAM,linkedin.com/in/juan,Pedro
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  <span className="font-medium">LinkedIn</span> y <span className="font-medium">Referido</span> son
                  opcionales
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  importCountry ? "cursor-pointer hover:border-primary/50" : "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => importCountry && fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  {importCountry ? "Selecciona un archivo CSV o Excel (.csv, .txt)" : "Primero selecciona un país"}
                </p>
                <Button variant="outline" size="sm" disabled={!importCountry}>
                  Seleccionar archivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!importCountry}
                />
              </div>

              {/* Download template */}
              <Button variant="ghost" size="sm" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar plantilla
              </Button>
            </div>
          )}

          {importStep === "preview" && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Valid rows */}
              {importPreview.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{importPreview.length} filas válidas</span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
                    {importPreview.slice(0, 5).map((row, i) => (
                      <p key={i} className="text-xs truncate">
                        {row.first_name} {row.last_name} - {row.role_title || "Sin cargo"} -{" "}
                        {getUniversityName(row.account_id)} - {row.referred_by || "Sin referido"}
                      </p>
                    ))}
                    {importPreview.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-1">...y {importPreview.length - 5} más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Error rows */}
              {importErrors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">{importErrors.length} filas con errores</span>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {importErrors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">
                        Fila {err.row}: {err.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {importStep === "result" && importResult && (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="font-medium text-lg">Importación completada</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
                  <p className="text-sm text-muted-foreground">Creados</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-600">{importResult.updated}</p>
                  <p className="text-sm text-muted-foreground">Actualizados</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-red-600">{importResult.errors?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Errores</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {importStep === "upload" && (
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancelar
              </Button>
            )}
            {importStep === "preview" && (
              <>
                <Button variant="outline" onClick={resetImport}>
                  Volver
                </Button>
                <Button onClick={handleImportConfirm} disabled={isPending || importPreview.length === 0}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Importar {importPreview.length} KDMs
                </Button>
              </>
            )}
            {importStep === "result" && <Button onClick={() => setIsImportDialogOpen(false)}>Cerrar</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
