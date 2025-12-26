"use client"

import { useState, useEffect } from "react"
import { Activity } from "lucide-react"
import { GlobalFilters, type FilterState } from "@/components/performance/global-filters"
import { TablaActividadComercial, type ActivityLogItem } from "@/components/performance/tabla-actividad"
import { getDateRangeFromPreset, getActivityLog, getTeamMembersWithCountries } from "@/lib/actions/performance"
import { getActiveCountries } from "@/lib/actions/countries"

export default function ActividadPage() {
  const [filters, setFilters] = useState<FilterState>({
    periodo: "ultimos_7",
    comparar: false,
    rol: "todos",
    usuario: "todos",
    pais: "todos",
  })

  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: string; name: string; role: string; countries: string[] }>
  >([])
  const [countries, setCountries] = useState<Array<{ code: string; name: string }>>([])
  const [activityData, setActivityData] = useState<ActivityLogItem[]>([])

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [members, countriesData] = await Promise.all([getTeamMembersWithCountries(), getActiveCountries()])
        setTeamMembers(
          members.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role || "SDR",
            countries: m.countries || [],
          })),
        )
        setCountries(countriesData.map((c) => ({ code: c.code, name: c.name })))
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadInitialData()
  }, [])

  // Load activity data when filters change
  useEffect(() => {
    async function loadActivityData() {
      setLoading(true)
      try {
        const dateRange = getDateRangeFromPreset(
          filters.periodo as any,
          filters.dateRange ? { from: filters.dateRange.from!, to: filters.dateRange.to! } : undefined,
        )

        const data = await getActivityLog(dateRange, {
          usuario: filters.usuario,
          rol: filters.rol,
          countryCode: filters.pais,
        })

        setActivityData(data)
      } catch (error) {
        console.error("Error loading activity data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivityData()
  }, [filters])

  const handleExportCSV = () => {
    // Generate CSV
    const headers = ["Usuario", "Rol", "Acción", "Entidad", "Tipo Entidad", "Canal", "Fecha/Hora"]
    const rows = activityData.map((item) => [
      item.usuario,
      item.rol,
      item.tipoAccion,
      item.entidad,
      item.entidadTipo,
      item.canal,
      item.fechaHora,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `actividad_comercial_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalFilters
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={teamMembers}
        countries={countries}
        showPeriodo={true}
      />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Actividad Comercial
          </h1>
          <p className="text-muted-foreground">Registro cronológico de todas las acciones del equipo</p>
        </div>

        {/* Tabla de actividad */}
        <TablaActividadComercial
          data={activityData}
          loading={loading}
          teamMembers={teamMembers}
          onExportCSV={handleExportCSV}
        />
      </div>
    </div>
  )
}
