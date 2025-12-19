"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Pencil, Trash2, Loader2, Search, Power, PowerOff, Building2, User, Mail, Phone, Globe } from "lucide-react"
import { toast } from "sonner"
import {
  getKDMContacts,
  createKDMContact,
  updateKDMContact,
  deleteKDMContact,
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
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterUniversity, setFilterUniversity] = useState<string>("all")

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedKDM, setSelectedKDM] = useState<KDMContact | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_title: "",
    linkedin_url: "",
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

  // Filter logic
  const filteredKDMs = kdmContacts.filter((kdm) => {
    const matchesSearch =
      !search ||
      `${kdm.first_name} ${kdm.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      kdm.email?.toLowerCase().includes(search.toLowerCase()) ||
      kdm.role_title?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && kdm.is_active) ||
      (filterStatus === "inactive" && !kdm.is_active)

    const matchesCountry = filterCountry === "all" || kdm.accounts?.some((a) => a.country_code === filterCountry)

    const matchesUniversity = filterUniversity === "all" || kdm.accounts?.some((a) => a.id === filterUniversity)

    return matchesSearch && matchesStatus && matchesCountry && matchesUniversity
  })

  // Get unique universities from KDMs for filter
  const universitiesInKDMs = Array.from(new Set(kdmContacts.flatMap((k) => k.accounts?.map((a) => a.id) || [])))
    .map((id) => accounts.find((a) => a.id === id))
    .filter(Boolean) as Account[]

  const openCreateDialog = () => {
    setSelectedKDM(null)
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role_title: "",
      linkedin_url: "",
      notes: "",
      account_id: "",
      country_code: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (kdm: KDMContact) => {
    setSelectedKDM(kdm)
    setFormData({
      first_name: kdm.first_name,
      last_name: kdm.last_name,
      email: kdm.email || "",
      phone: kdm.phone || "",
      role_title: kdm.role_title || "",
      linkedin_url: kdm.linkedin_url || "",
      notes: kdm.notes || "",
      account_id: kdm.accounts?.[0]?.id || "",
      country_code: kdm.accounts?.[0]?.country_code || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error("Nombre y apellido son requeridos")
      return
    }

    startTransition(async () => {
      try {
        if (selectedKDM) {
          await updateKDMContact({
            id: selectedKDM.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email || null,
            phone: formData.phone || null,
            role_title: formData.role_title || null,
            linkedin_url: formData.linkedin_url || null,
            notes: formData.notes || null,
          })
          toast.success("KDM actualizado")
        } else {
          await createKDMContact(
            {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email || null,
              phone: formData.phone || null,
              role_title: formData.role_title || null,
              linkedin_url: formData.linkedin_url || null,
              notes: formData.notes || null,
            },
            formData.account_id || undefined,
            formData.country_code || undefined,
          )
          toast.success("KDM creado")
        }
        setDialogOpen(false)
        loadData()
      } catch (error) {
        toast.error("Error al guardar KDM")
      }
    })
  }

  const handleToggleStatus = async (kdm: KDMContact) => {
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

  const handleDelete = async () => {
    if (!selectedKDM) return

    startTransition(async () => {
      try {
        await deleteKDMContact(selectedKDM.id)
        toast.success("KDM eliminado")
        setDeleteDialogOpen(false)
        setSelectedKDM(null)
        loadData()
      } catch (error) {
        toast.error("Error al eliminar KDM")
      }
    })
  }

  // Filter accounts by selected country
  const filteredAccounts = formData.country_code
    ? accounts.filter((a) => a.country_code === formData.country_code)
    : accounts

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KDM - Tomadores de Decisión</h1>
          <p className="text-muted-foreground">Vista global de todos los KDM</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary border-primary">
            <Globe className="h-3 w-3 mr-1" />
            {filteredKDMs.length} KDMs
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email, cargo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[180px]">
              <Select value={filterUniversity} onValueChange={setFilterUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder="Universidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {universitiesInKDMs.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los KDM</CardTitle>
          <CardDescription>
            {filteredKDMs.length} de {kdmContacts.length} KDMs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Universidad</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKDMs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay KDMs registrados
                  </TableCell>
                </TableRow>
              ) : (
                filteredKDMs.map((kdm) => (
                  <TableRow key={kdm.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {kdm.first_name} {kdm.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {kdm.accounts && kdm.accounts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {kdm.accounts.map((a) => (
                            <Badge key={a.id} variant="outline" className="text-xs">
                              <Building2 className="h-3 w-3 mr-1" />
                              {a.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin vincular</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {kdm.accounts && kdm.accounts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(kdm.accounts.map((a) => a.country_code))].map((code) => {
                            const country = countries.find((c) => c.code === code)
                            return (
                              <Badge key={code} variant="secondary" className="text-xs">
                                {country?.flag} {code}
                              </Badge>
                            )
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{kdm.role_title || "-"}</TableCell>
                    <TableCell>
                      {kdm.email ? (
                        <a
                          href={`mailto:${kdm.email}`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {kdm.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {kdm.phone ? (
                        <a href={`tel:${kdm.phone}`} className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {kdm.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={kdm.is_active ? "default" : "secondary"}>
                        {kdm.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(kdm)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(kdm)}>
                          {kdm.is_active ? (
                            <PowerOff className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Power className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedKDM(kdm)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedKDM ? "Editar KDM" : "Nuevo KDM"}</DialogTitle>
            <DialogDescription>
              {selectedKDM ? "Modifica los datos del KDM" : "Agrega un nuevo tomador de decisión"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="Director de Empleabilidad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@universidad.edu"
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
            {!selectedKDM && (
              <>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select
                    value={formData.country_code}
                    onValueChange={(v) => setFormData({ ...formData, country_code: v, account_id: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar país" />
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
                <div className="space-y-2">
                  <Label>Universidad (opcional)</Label>
                  <Select
                    value={formData.account_id}
                    onValueChange={(v) => setFormData({ ...formData, account_id: v })}
                    disabled={!formData.country_code}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={formData.country_code ? "Seleccionar universidad" : "Primero selecciona un país"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedKDM ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar KDM</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a {selectedKDM?.first_name} {selectedKDM?.last_name}? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
