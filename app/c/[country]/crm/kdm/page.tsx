"use client"

import type React from "react"

import { useState, useEffect, useCallback, useTransition, useRef } from "react"
import { useParams } from "next/navigation"
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
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  FileText,
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

interface Account {
  id: string
  name: string
  country_code: string
}

export default function KDMPage() {
  const { country } = useParams<{ country: string }>()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [kdmContacts, setKdmContacts] = useState<KDMContact[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showInactive, setShowInactive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAccount, setFilterAccount] = useState<string>("all")

  // Dialog states
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
  const [editingKDM, setEditingKDM] = useState<KDMContact | null>(null)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importStep, setImportStep] = useState<"upload" | "preview" | "result">("upload")
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [importErrors, setImportErrors] = useState<{ row: number; data: any; reason: string }[]>([])
  const [importResult, setImportResult] = useState<{ created: number; updated: number; errors: any[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newKDM, setNewKDM] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_title: "",
    linkedin_url: "",
    notes: "",
    university: "",
  })

  const loadData = useCallback(async () => {
    try {
      const [kdmData, accountsData] = await Promise.all([getKDMContacts(country), getAccounts()])
      setKdmContacts(kdmData || [])
      setAccounts((accountsData || []).filter((a) => a.country_code === country))
    } catch (error) {
      console.error("Error loading KDM data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter contacts
  const filteredContacts = kdmContacts
    .filter((c) => showInactive || c.is_active !== false)
    .filter((c) => {
      if (!searchQuery) return true
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.accounts?.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .filter((c) => {
      if (filterAccount === "all") return true
      return c.accounts?.some((a) => a.id === filterAccount)
    })

  const handleCreateKDM = () => {
    if (!newKDM.first_name) {
      toast.error("El nombre es requerido")
      return
    }

    startTransition(async () => {
      try {
        // Find the account if university is specified
        let accountId: string | undefined
        if (newKDM.university) {
          const account = accounts.find((a) => a.name.toLowerCase() === newKDM.university.toLowerCase())
          if (account) {
            accountId = account.id
          }
        }

        await createKDMContact(
          {
            first_name: newKDM.first_name,
            last_name: newKDM.last_name || "",
            email: newKDM.email || null,
            phone: newKDM.phone || null,
            role_title: newKDM.role_title || null,
            linkedin_url: newKDM.linkedin_url || null,
            notes: newKDM.notes || null,
          },
          accountId,
          country,
        )
        toast.success("KDM creado")
        setNewKDM({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          role_title: "",
          linkedin_url: "",
          notes: "",
          university: "",
        })
        setIsNewDialogOpen(false)
        loadData()
      } catch (error) {
        toast.error("Error al crear KDM")
      }
    })
  }

  const handleUpdateKDM = () => {
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
          notes: editingKDM.notes,
          is_active: editingKDM.is_active,
        })
        toast.success("KDM actualizado")
        setEditingKDM(null)
        loadData()
      } catch (error) {
        toast.error("Error al actualizar")
      }
    })
  }

  const handleDeleteKDM = (id: string) => {
    startTransition(async () => {
      try {
        await deleteKDMContact(id)
        toast.success("KDM eliminado")
        loadData()
      } catch (error) {
        toast.error("Error al eliminar")
      }
    })
  }

  const handleToggleActive = (kdm: KDMContact) => {
    startTransition(async () => {
      try {
        await updateKDMContact({ id: kdm.id, is_active: !kdm.is_active })
        toast.success(kdm.is_active ? "KDM desactivado" : "KDM activado")
        loadData()
      } catch (error) {
        toast.error("Error al cambiar estado")
      }
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        toast.error("El archivo debe tener al menos una fila de encabezados y una de datos")
        return
      }

      // Parse CSV handling commas within quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            result.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, "").trim())

      // Map expected headers - more flexible mapping
      const headerMap: { [key: string]: string } = {
        // Name variations
        nombre: "full_name",
        name: "full_name",
        "nombre completo": "full_name",
        full_name: "full_name",
        first_name: "first_name",
        apellido: "last_name",
        last_name: "last_name",
        // Title/role variations
        cargo: "role_title",
        role: "role_title",
        role_title: "role_title",
        puesto: "role_title",
        titulo: "role_title",
        title: "role_title",
        // Contact variations
        email: "email",
        correo: "email",
        "correo electronico": "email",
        telefono: "phone",
        teléfono: "phone",
        phone: "phone",
        celular: "phone",
        whatsapp: "phone",
        // University variations
        universidad: "university",
        university: "university",
        institucion: "university",
        institución: "university",
        // LinkedIn variations
        linkedin: "linkedin_url",
        linkedin_url: "linkedin_url",
        "linkedin url": "linkedin_url",
      }

      const validRows: any[] = []
      const errorRows: { row: number; data: any; reason: string }[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length === 0 || values.every((v) => !v)) continue

        const row: any = { country_code: country }

        headers.forEach((header, idx) => {
          const mappedKey = headerMap[header]
          if (mappedKey && values[idx]) {
            row[mappedKey] = values[idx].replace(/^["']|["']$/g, "").trim()
          }
        })

        // Handle full_name -> first_name + last_name
        if (row.full_name && !row.first_name) {
          const nameParts = row.full_name.trim().split(/\s+/)
          row.first_name = nameParts[0] || ""
          row.last_name = nameParts.slice(1).join(" ") || ""
        }

        // Validate required fields
        if (!row.first_name) {
          errorRows.push({ row: i + 1, data: row, reason: "Falta el nombre" })
          continue
        }

        // Validate university exists in this country
        if (row.university) {
          const universityExists = accounts.some((a) => a.name.toLowerCase() === row.university.toLowerCase())
          if (!universityExists) {
            errorRows.push({
              row: i + 1,
              data: row,
              reason: `Universidad "${row.university}" no encontrada en ${country}`,
            })
            continue
          }
        }

        validRows.push(row)
      }

      setImportPreview(validRows)
      setImportErrors(errorRows)
      setImportStep("preview")
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (!importPreview.length) return

    startTransition(async () => {
      try {
        const result = await importKDMFromCSV(importPreview)
        setImportResult(result)
        setImportStep("result")
        loadData()
        toast.success(`Importación completada: ${result.created} creados, ${result.updated} actualizados`)
      } catch (error) {
        toast.error("Error en la importación")
      }
    })
  }

  const resetImportDialog = () => {
    setImportStep("upload")
    setImportPreview([])
    setImportErrors([])
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadTemplate = () => {
    const csv =
      "Nombre,Cargo,Email,Teléfono,Universidad,LinkedIn\nJuan Pérez,Rector,juan@itam.mx,+52 55 1234 5678,ITAM,https://linkedin.com/in/juan"
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "kdm_template.csv"
    a.click()
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
          <h1 className="text-2xl font-bold">KDM - Tomadores de Decisión</h1>
          <p className="text-muted-foreground">Gestión de contactos clave por universidad</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-1">
            <User className="mr-2 h-4 w-4" />
            {filteredContacts.length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o universidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Universidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
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
            <Button
              variant="outline"
              onClick={() => {
                resetImportDialog()
                setIsImportDialogOpen(true)
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir CSV
            </Button>
            <Button onClick={() => setIsNewDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo KDM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de KDM</CardTitle>
          <CardDescription>{filteredContacts.length} contactos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Universidad</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((kdm) => (
                <TableRow key={kdm.id} className={kdm.is_active === false ? "opacity-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>
                        {kdm.first_name} {kdm.last_name}
                      </span>
                      {kdm.linkedin_url && (
                        <a
                          href={kdm.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {kdm.accounts?.map((a) => (
                        <Badge key={a.id} variant={a.is_primary ? "default" : "outline"} className="text-xs">
                          {a.name}
                          {a.is_primary && " ★"}
                        </Badge>
                      ))}
                      {(!kdm.accounts || kdm.accounts.length === 0) && (
                        <span className="text-muted-foreground text-xs">Sin asignar</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{kdm.role_title || "-"}</TableCell>
                  <TableCell>
                    {kdm.email ? (
                      <a href={`mailto:${kdm.email}`} className="text-primary hover:underline flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {kdm.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {kdm.phone ? (
                      <a
                        href={`https://wa.me/${kdm.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        className="text-green-600 hover:underline flex items-center gap-1"
                        rel="noreferrer"
                      >
                        <Phone className="h-3 w-3" />
                        {kdm.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {kdm.is_active !== false ? (
                      <Badge className="bg-green-600">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingKDM(kdm)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(kdm)}>
                        {kdm.is_active !== false ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteKDM(kdm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay contactos KDM
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New KDM Dialog - Added university field */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo KDM</DialogTitle>
            <DialogDescription>Agregar un nuevo tomador de decisión</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newKDM.first_name}
                onChange={(e) => setNewKDM({ ...newKDM, first_name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={newKDM.role_title}
                onChange={(e) => setNewKDM({ ...newKDM, role_title: e.target.value })}
                placeholder="Rector, Director, Decano..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newKDM.email}
                  onChange={(e) => setNewKDM({ ...newKDM, email: e.target.value })}
                  placeholder="juan@universidad.edu"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={newKDM.phone}
                  onChange={(e) => setNewKDM({ ...newKDM, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Universidad</Label>
              <Select value={newKDM.university} onValueChange={(value) => setNewKDM({ ...newKDM, university: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar universidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.name}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn (opcional)</Label>
              <Input
                value={newKDM.linkedin_url}
                onChange={(e) => setNewKDM({ ...newKDM, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={newKDM.notes}
                onChange={(e) => setNewKDM({ ...newKDM, notes: e.target.value })}
                placeholder="Información adicional..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateKDM} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear KDM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit KDM Dialog */}
      <Dialog open={!!editingKDM} onOpenChange={(open) => !open && setEditingKDM(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar KDM</DialogTitle>
          </DialogHeader>
          {editingKDM && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={editingKDM.first_name}
                  onChange={(e) => setEditingKDM({ ...editingKDM, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input
                  value={editingKDM.last_name}
                  onChange={(e) => setEditingKDM({ ...editingKDM, last_name: e.target.value })}
                />
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
                <Label>Notas</Label>
                <Textarea
                  value={editingKDM.notes || ""}
                  onChange={(e) => setEditingKDM({ ...editingKDM, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingKDM.is_active !== false}
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
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetImportDialog()
          setIsImportDialogOpen(open)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir KDMs desde CSV</DialogTitle>
            <DialogDescription>
              Importa tomadores de decisión en lote. Los existentes se actualizarán.
            </DialogDescription>
          </DialogHeader>

          {importStep === "upload" && (
            <div className="space-y-4 py-4">
              {/* Format info box */}
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <p className="font-medium mb-2">Formato requerido:</p>
                <code className="block bg-background rounded p-2 text-xs font-mono">
                  Nombre,Cargo,Email,Teléfono,Universidad,LinkedIn
                  <br />
                  Juan Pérez,Rector,juan@itam.mx,+52 55 1234 5678,ITAM,https://linkedin.com/in/juan
                  <br />
                  María García,Directora,maria@unam.mx,+52 55 9876 5432,UNAM,
                </code>
                <div className="mt-3 space-y-1 text-muted-foreground">
                  <p>
                    <strong>Nombre:</strong> Requerido
                  </p>
                  <p>
                    <strong>Cargo, Email, Teléfono, Universidad:</strong> Opcionales
                  </p>
                  <p>
                    <strong>LinkedIn:</strong> Opcional, al final
                  </p>
                </div>
              </div>

              {/* Upload area */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Selecciona un archivo CSV o Excel (.csv, .txt)</p>
                <Button variant="outline">Seleccionar archivo</Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Download template button */}
              <div className="flex justify-center">
                <Button variant="link" onClick={downloadTemplate} className="text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar plantilla CSV
                </Button>
              </div>
            </div>
          )}

          {importStep === "preview" && (
            <div className="space-y-4 py-4">
              {/* Summary */}
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg border bg-green-50 p-3 text-center">
                  <CheckCircle className="mx-auto h-6 w-6 text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-600">{importPreview.length}</p>
                  <p className="text-xs text-green-700">Filas válidas</p>
                </div>
                {importErrors.length > 0 && (
                  <div className="flex-1 rounded-lg border bg-red-50 p-3 text-center">
                    <AlertCircle className="mx-auto h-6 w-6 text-red-600 mb-1" />
                    <p className="text-2xl font-bold text-red-600">{importErrors.length}</p>
                    <p className="text-xs text-red-700">Con errores</p>
                  </div>
                )}
              </div>

              {/* Preview table */}
              {importPreview.length > 0 && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Universidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.slice(0, 10).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {row.first_name} {row.last_name}
                          </TableCell>
                          <TableCell>{row.role_title || "-"}</TableCell>
                          <TableCell>{row.email || "-"}</TableCell>
                          <TableCell>{row.phone || "-"}</TableCell>
                          <TableCell>{row.university || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {importPreview.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            ... y {importPreview.length - 10} más
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <p className="font-medium text-red-700 mb-2">Filas con errores:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>
                        Fila {err.row}: {err.reason}
                      </li>
                    ))}
                    {importErrors.length > 5 && <li>... y {importErrors.length - 5} errores más</li>}
                  </ul>
                </div>
              )}
            </div>
          )}

          {importStep === "result" && importResult && (
            <div className="space-y-4 py-4">
              <div className="flex gap-4 justify-center">
                <div className="rounded-lg border bg-green-50 p-4 text-center min-w-[120px]">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <p className="text-3xl font-bold text-green-600">{importResult.created}</p>
                  <p className="text-sm text-green-700">Creados</p>
                </div>
                <div className="rounded-lg border bg-blue-50 p-4 text-center min-w-[120px]">
                  <FileText className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-3xl font-bold text-blue-600">{importResult.updated}</p>
                  <p className="text-sm text-blue-700">Actualizados</p>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="rounded-lg border bg-red-50 p-4 text-center min-w-[120px]">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
                    <p className="text-3xl font-bold text-red-600">{importResult.errors.length}</p>
                    <p className="text-sm text-red-700">Errores</p>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg p-3 bg-red-50 max-h-32 overflow-y-auto">
                  <p className="font-medium text-red-700 mb-2">Errores durante la importación:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>
                        Fila {err.row}: {err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetImportDialog()
                setIsImportDialogOpen(false)
              }}
            >
              {importStep === "result" ? "Cerrar" : "Cancelar"}
            </Button>
            {importStep === "preview" && importPreview.length > 0 && (
              <Button onClick={handleImport} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar {importPreview.length} KDMs
              </Button>
            )}
            {importStep === "preview" && importPreview.length === 0 && (
              <Button variant="outline" onClick={resetImportDialog}>
                Volver a intentar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
