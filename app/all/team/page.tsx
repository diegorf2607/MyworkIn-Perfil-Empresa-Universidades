"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { getTeamMembers, updateTeamMember, deleteTeamMember } from "@/lib/actions/team"
import { getActiveCountries } from "@/lib/actions/countries"
import type { TeamMember, Country } from "@/lib/types"

const COUNTRY_FLAGS: Record<string, string> = {
  PE: "🇵🇪",
  MX: "🇲🇽",
  CO: "🇨🇴",
  CL: "🇨🇱",
  AR: "🇦🇷",
  EC: "🇪🇨",
  BR: "🇧🇷",
}

export default function GlobalTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
    country_codes: [] as string[],
    is_active: true,
    password: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [membersData, countriesData] = await Promise.all([getTeamMembers(), getActiveCountries()])
      setTeamMembers(membersData)
      setCountries(countriesData || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
    const matchesCountry =
      filterCountry === "all" || (member.country_codes && member.country_codes.includes(filterCountry))
    const matchesActive = showInactive || member.is_active !== false
    return matchesSearch && matchesCountry && matchesActive
  })

  function openNewMemberDialog() {
    setEditingMember(null)
    setFormData({
      name: "",
      email: "",
      role: "admin",
      country_codes: [],
      is_active: true,
      password: "",
    })
    setIsDialogOpen(true)
  }

  function openEditMemberDialog(member: TeamMember) {
    setEditingMember(member)
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      country_codes: member.country_codes || [],
      is_active: member.is_active !== false,
      password: "",
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.name || !formData.email) {
      toast.error("Nombre y email son requeridos")
      return
    }

    if (!editingMember && !formData.password) {
      toast.error("La contraseña es requerida para nuevos miembros")
      return
    }

    if (formData.role === "user" && formData.country_codes.length === 0) {
      toast.error("Usuarios deben tener al menos un país asignado")
      return
    }

    try {
      if (editingMember) {
        await updateTeamMember({
          id: editingMember.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          country_codes: formData.country_codes,
          is_active: formData.is_active,
        })
        toast.success("Miembro actualizado")
      } else {
        const response = await fetch("/api/team/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            country_codes: formData.role === "user" ? formData.country_codes : [],
            is_active: formData.is_active,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al crear miembro")
        }

        toast.success("Miembro creado exitosamente")
      }
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este miembro del equipo?")) return
    try {
      await deleteTeamMember(id)
      toast.success("Miembro eliminado")
      loadData()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  function toggleCountry(code: string) {
    setFormData((prev) => ({
      ...prev,
      country_codes: prev.country_codes.includes(code)
        ? prev.country_codes.filter((c) => c !== code)
        : [...prev.country_codes, code],
    }))
  }

  // Group members by country for summary
  const membersByCountry = countries.map((country) => ({
    country,
    members: teamMembers.filter((m) => m.country_codes?.includes(country.code) && m.is_active !== false),
  }))

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Equipo Global</h1>
            <p className="text-muted-foreground">Gestiona los miembros del equipo y sus países asignados</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewMemberDialog} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? "Editar miembro" : "Nuevo miembro"}</DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Actualiza los datos del miembro del equipo"
                    : "Agrega un nuevo miembro y asígnale países"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@myworkin.com"
                    disabled={!!editingMember}
                  />
                </div>
                {!editingMember && (
                  <div className="space-y-2">
                    <Label>Contraseña *</Label>
                    <Input
                      type="password"
                      value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Rol *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">Usuario</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.role === "admin"
                      ? "Acceso completo a todos los países"
                      : "Solo ve datos de países asignados"}
                  </p>
                </div>
                {formData.role === "user" && (
                  <div className="space-y-2">
                    <Label>Países asignados *</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-md min-h-[60px]">
                      {countries.length === 0 ? (
                        <p className="text-sm text-muted-foreground col-span-2 text-center py-2">
                          No hay países activos. Crea un país primero desde "Todos los países".
                        </p>
                      ) : (
                        countries.map((country) => (
                          <div key={country.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={country.code}
                              checked={formData.country_codes.includes(country.code)}
                              onCheckedChange={() => toggleCountry(country.code)}
                            />
                            <label htmlFor={country.code} className="text-sm cursor-pointer flex items-center gap-1">
                              <span>{COUNTRY_FLAGS[country.code] || "🌐"}</span>
                              {country.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {formData.country_codes.length === 0 && countries.length > 0 && (
                      <p className="text-xs text-destructive">Selecciona al menos un país</p>
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  {editingMember ? "Guardar" : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary by country */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {membersByCountry.map(({ country, members }) => (
            <Card key={country.code} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl mb-1">{COUNTRY_FLAGS[country.code] || "🌐"}</div>
                <div className="font-semibold text-lg">{members.length}</div>
                <div className="text-xs text-muted-foreground">{country.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and table */}
        <Card>
          <CardHeader className="p-8 pb-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Users className="h-7 w-7 text-primary" />
              Todos los miembros
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {filteredMembers.length} miembros {!showInactive && "activos"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="w-[200px] h-11">
                  <SelectValue placeholder="Filtrar país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {COUNTRY_FLAGS[country.code]} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-3 px-2">
                <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                <Label htmlFor="show-inactive" className="text-base cursor-pointer">
                  Mostrar inactivos
                </Label>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-lg">Cargando...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-lg">No hay miembros del equipo</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-4 text-base">Nombre</TableHead>
                    <TableHead className="py-4 text-base">Email</TableHead>
                    <TableHead className="py-4 text-base">Rol</TableHead>
                    <TableHead className="py-4 text-base">Países</TableHead>
                    <TableHead className="py-4 text-base">Estado</TableHead>
                    <TableHead className="py-4 text-base text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className={member.is_active === false ? "opacity-50" : ""}>
                      <TableCell className="py-4 font-medium text-base">{member.name}</TableCell>
                      <TableCell className="py-4 text-base">{member.email}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-sm py-1 px-3">{member.role === "admin" ? "Admin" : "Usuario"}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {member.country_codes?.map((code) => (
                            <Badge key={code} variant="secondary" className="text-xs py-1">
                              {COUNTRY_FLAGS[code] || "🌐"} {code}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {member.is_active !== false ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm py-1 px-3 hover:bg-emerald-200">Activo</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-sm py-1 px-3">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditMemberDialog(member)} className="h-9 w-9">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="h-9 w-9">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
