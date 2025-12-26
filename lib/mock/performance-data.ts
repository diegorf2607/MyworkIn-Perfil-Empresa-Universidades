// Mock data para Performance Comercial & Control de Actividad
// Este archivo será reemplazado por data real de Supabase en el futuro

export interface TeamMember {
  id: string
  name: string
  role: "SDR" | "AE"
  country: string
  avatar?: string
}

export interface ActivityMetrics {
  universidadesCreadas: number
  leadsCreados: number
  kdmsCreados: number
  correosEnviados: number
  followUpsEjecutados: number
  diasActivos: number
}

export interface EngagementMetrics {
  tasaEntrega: number
  tasaApertura: number
  tasaRespuesta: number
  tasaInteresados: number
  tasaOptOut: number
  tasaRebote: number
  noAlcanzados: number
}

export interface ResultsMetrics {
  sqlsGenerados: number
  reunionesAgendadas: number
  reunionesCompletadas: number
  noShows: number
  dealsCreados: number
  dealsGanados: number
  mrrGenerado: number
}

export interface PersonPerformance {
  member: TeamMember
  activity: ActivityMetrics
  engagement: EngagementMetrics
  results: ResultsMetrics
  previousPeriod?: {
    activity: ActivityMetrics
    engagement: EngagementMetrics
    results: ResultsMetrics
  }
}

export interface WeeklySummary {
  semanaActual: {
    correosEnviados: number
    respuestas: number
    interesados: number
    reunionesAgendadas: number
    sqls: number
    dealsGanados: number
    mrr: number
  }
  semanaAnterior: {
    correosEnviados: number
    respuestas: number
    interesados: number
    reunionesAgendadas: number
    sqls: number
    dealsGanados: number
    mrr: number
  }
}

export interface FunnelStage {
  name: string
  count: number
  conversionFromPrevious?: number
}

export interface ActivityLog {
  id: string
  usuario: string
  rol: "SDR" | "AE"
  tipoAccion:
    | "crear_universidad"
    | "crear_lead"
    | "crear_kdm"
    | "correo_enviado"
    | "respuesta_recibida"
    | "reunion_agendada"
    | "reunion_completada"
    | "deal_creado"
    | "deal_ganado"
  entidad: string
  entidadTipo: "universidad" | "kdm" | "reunion" | "deal"
  canal: "email" | "manual"
  fechaHora: string
}

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Carlos Mendoza", role: "SDR", country: "MX" },
  { id: "2", name: "Ana García", role: "SDR", country: "CO" },
  { id: "3", name: "Diego Rodríguez", role: "AE", country: "PE" },
  { id: "4", name: "María López", role: "AE", country: "BR" },
  { id: "5", name: "Juan Pérez", role: "SDR", country: "MX" },
]

// Mock Performance Data
export const mockPerformanceData: PersonPerformance[] = [
  {
    member: mockTeamMembers[0],
    activity: {
      universidadesCreadas: 12,
      leadsCreados: 8,
      kdmsCreados: 15,
      correosEnviados: 145,
      followUpsEjecutados: 32,
      diasActivos: 5,
    },
    engagement: {
      tasaEntrega: 96.5,
      tasaApertura: 42.3,
      tasaRespuesta: 12.8,
      tasaInteresados: 8.2,
      tasaOptOut: 0.8,
      tasaRebote: 3.5,
      noAlcanzados: 4,
    },
    results: {
      sqlsGenerados: 6,
      reunionesAgendadas: 4,
      reunionesCompletadas: 3,
      noShows: 1,
      dealsCreados: 2,
      dealsGanados: 1,
      mrrGenerado: 2500,
    },
    previousPeriod: {
      activity: {
        universidadesCreadas: 10,
        leadsCreados: 6,
        kdmsCreados: 12,
        correosEnviados: 120,
        followUpsEjecutados: 28,
        diasActivos: 4,
      },
      engagement: {
        tasaEntrega: 95.0,
        tasaApertura: 38.5,
        tasaRespuesta: 10.2,
        tasaInteresados: 6.5,
        tasaOptOut: 1.2,
        tasaRebote: 5.0,
        noAlcanzados: 6,
      },
      results: {
        sqlsGenerados: 4,
        reunionesAgendadas: 3,
        reunionesCompletadas: 2,
        noShows: 1,
        dealsCreados: 1,
        dealsGanados: 0,
        mrrGenerado: 0,
      },
    },
  },
  {
    member: mockTeamMembers[1],
    activity: {
      universidadesCreadas: 18,
      leadsCreados: 14,
      kdmsCreados: 22,
      correosEnviados: 210,
      followUpsEjecutados: 45,
      diasActivos: 5,
    },
    engagement: {
      tasaEntrega: 97.2,
      tasaApertura: 48.6,
      tasaRespuesta: 15.4,
      tasaInteresados: 11.2,
      tasaOptOut: 0.5,
      tasaRebote: 2.8,
      noAlcanzados: 2,
    },
    results: {
      sqlsGenerados: 9,
      reunionesAgendadas: 7,
      reunionesCompletadas: 6,
      noShows: 1,
      dealsCreados: 4,
      dealsGanados: 2,
      mrrGenerado: 5800,
    },
    previousPeriod: {
      activity: {
        universidadesCreadas: 15,
        leadsCreados: 11,
        kdmsCreados: 18,
        correosEnviados: 180,
        followUpsEjecutados: 38,
        diasActivos: 5,
      },
      engagement: {
        tasaEntrega: 96.5,
        tasaApertura: 45.2,
        tasaRespuesta: 13.8,
        tasaInteresados: 9.5,
        tasaOptOut: 0.7,
        tasaRebote: 3.5,
        noAlcanzados: 3,
      },
      results: {
        sqlsGenerados: 7,
        reunionesAgendadas: 5,
        reunionesCompletadas: 4,
        noShows: 1,
        dealsCreados: 3,
        dealsGanados: 1,
        mrrGenerado: 3200,
      },
    },
  },
  {
    member: mockTeamMembers[2],
    activity: {
      universidadesCreadas: 5,
      leadsCreados: 3,
      kdmsCreados: 8,
      correosEnviados: 85,
      followUpsEjecutados: 22,
      diasActivos: 4,
    },
    engagement: {
      tasaEntrega: 94.8,
      tasaApertura: 52.1,
      tasaRespuesta: 18.6,
      tasaInteresados: 14.2,
      tasaOptOut: 0.3,
      tasaRebote: 5.2,
      noAlcanzados: 5,
    },
    results: {
      sqlsGenerados: 4,
      reunionesAgendadas: 8,
      reunionesCompletadas: 7,
      noShows: 1,
      dealsCreados: 5,
      dealsGanados: 3,
      mrrGenerado: 9500,
    },
    previousPeriod: {
      activity: {
        universidadesCreadas: 4,
        leadsCreados: 2,
        kdmsCreados: 6,
        correosEnviados: 70,
        followUpsEjecutados: 18,
        diasActivos: 4,
      },
      engagement: {
        tasaEntrega: 93.5,
        tasaApertura: 48.3,
        tasaRespuesta: 16.2,
        tasaInteresados: 12.5,
        tasaOptOut: 0.5,
        tasaRebote: 6.5,
        noAlcanzados: 7,
      },
      results: {
        sqlsGenerados: 3,
        reunionesAgendadas: 6,
        reunionesCompletadas: 5,
        noShows: 1,
        dealsCreados: 4,
        dealsGanados: 2,
        mrrGenerado: 6800,
      },
    },
  },
  {
    member: mockTeamMembers[3],
    activity: {
      universidadesCreadas: 3,
      leadsCreados: 2,
      kdmsCreados: 5,
      correosEnviados: 62,
      followUpsEjecutados: 18,
      diasActivos: 5,
    },
    engagement: {
      tasaEntrega: 98.1,
      tasaApertura: 55.4,
      tasaRespuesta: 22.3,
      tasaInteresados: 18.6,
      tasaOptOut: 0.2,
      tasaRebote: 1.9,
      noAlcanzados: 1,
    },
    results: {
      sqlsGenerados: 5,
      reunionesAgendadas: 10,
      reunionesCompletadas: 9,
      noShows: 1,
      dealsCreados: 7,
      dealsGanados: 4,
      mrrGenerado: 14200,
    },
    previousPeriod: {
      activity: {
        universidadesCreadas: 2,
        leadsCreados: 1,
        kdmsCreados: 4,
        correosEnviados: 55,
        followUpsEjecutados: 15,
        diasActivos: 4,
      },
      engagement: {
        tasaEntrega: 97.5,
        tasaApertura: 52.8,
        tasaRespuesta: 20.1,
        tasaInteresados: 16.2,
        tasaOptOut: 0.4,
        tasaRebote: 2.5,
        noAlcanzados: 2,
      },
      results: {
        sqlsGenerados: 4,
        reunionesAgendadas: 8,
        reunionesCompletadas: 7,
        noShows: 1,
        dealsCreados: 5,
        dealsGanados: 3,
        mrrGenerado: 10500,
      },
    },
  },
  {
    member: mockTeamMembers[4],
    activity: {
      universidadesCreadas: 8,
      leadsCreados: 5,
      kdmsCreados: 10,
      correosEnviados: 98,
      followUpsEjecutados: 24,
      diasActivos: 4,
    },
    engagement: {
      tasaEntrega: 95.2,
      tasaApertura: 38.7,
      tasaRespuesta: 9.8,
      tasaInteresados: 6.1,
      tasaOptOut: 1.1,
      tasaRebote: 4.8,
      noAlcanzados: 6,
    },
    results: {
      sqlsGenerados: 3,
      reunionesAgendadas: 2,
      reunionesCompletadas: 2,
      noShows: 0,
      dealsCreados: 1,
      dealsGanados: 0,
      mrrGenerado: 0,
    },
    previousPeriod: {
      activity: {
        universidadesCreadas: 6,
        leadsCreados: 4,
        kdmsCreados: 8,
        correosEnviados: 85,
        followUpsEjecutados: 20,
        diasActivos: 3,
      },
      engagement: {
        tasaEntrega: 94.0,
        tasaApertura: 35.2,
        tasaRespuesta: 8.5,
        tasaInteresados: 5.2,
        tasaOptOut: 1.5,
        tasaRebote: 6.0,
        noAlcanzados: 8,
      },
      results: {
        sqlsGenerados: 2,
        reunionesAgendadas: 1,
        reunionesCompletadas: 1,
        noShows: 0,
        dealsCreados: 0,
        dealsGanados: 0,
        mrrGenerado: 0,
      },
    },
  },
]

// Mock Weekly Summary
export const mockWeeklySummary: WeeklySummary = {
  semanaActual: {
    correosEnviados: 600,
    respuestas: 78,
    interesados: 45,
    reunionesAgendadas: 31,
    sqls: 27,
    dealsGanados: 10,
    mrr: 32000,
  },
  semanaAnterior: {
    correosEnviados: 510,
    respuestas: 62,
    interesados: 38,
    reunionesAgendadas: 23,
    sqls: 20,
    dealsGanados: 6,
    mrr: 20500,
  },
}

// Mock Funnel Data
export const mockFunnelData: FunnelStage[] = [
  { name: "Correos enviados", count: 600 },
  { name: "Respuestas", count: 78, conversionFromPrevious: 13.0 },
  { name: "Interesados", count: 45, conversionFromPrevious: 57.7 },
  { name: "Reuniones agendadas", count: 31, conversionFromPrevious: 68.9 },
  { name: "Reuniones completadas", count: 27, conversionFromPrevious: 87.1 },
  { name: "Ganados", count: 10, conversionFromPrevious: 37.0 },
]

// Mock Activity Log
export const mockActivityLog: ActivityLog[] = [
  {
    id: "1",
    usuario: "Carlos Mendoza",
    rol: "SDR",
    tipoAccion: "correo_enviado",
    entidad: "UNAM - Facultad de Ingeniería",
    entidadTipo: "universidad",
    canal: "email",
    fechaHora: "2025-01-25T14:32:00Z",
  },
  {
    id: "2",
    usuario: "Ana García",
    rol: "SDR",
    tipoAccion: "crear_kdm",
    entidad: "Dr. Roberto Sánchez",
    entidadTipo: "kdm",
    canal: "manual",
    fechaHora: "2025-01-25T13:45:00Z",
  },
  {
    id: "3",
    usuario: "Diego Rodríguez",
    rol: "AE",
    tipoAccion: "reunion_completada",
    entidad: "Universidad de Lima",
    entidadTipo: "reunion",
    canal: "manual",
    fechaHora: "2025-01-25T12:00:00Z",
  },
  {
    id: "4",
    usuario: "María López",
    rol: "AE",
    tipoAccion: "deal_ganado",
    entidad: "UNICAMP",
    entidadTipo: "deal",
    canal: "manual",
    fechaHora: "2025-01-25T11:30:00Z",
  },
  {
    id: "5",
    usuario: "Carlos Mendoza",
    rol: "SDR",
    tipoAccion: "respuesta_recibida",
    entidad: "TEC de Monterrey",
    entidadTipo: "universidad",
    canal: "email",
    fechaHora: "2025-01-25T10:15:00Z",
  },
  {
    id: "6",
    usuario: "Ana García",
    rol: "SDR",
    tipoAccion: "reunion_agendada",
    entidad: "Universidad de los Andes",
    entidadTipo: "reunion",
    canal: "manual",
    fechaHora: "2025-01-25T09:45:00Z",
  },
  {
    id: "7",
    usuario: "Juan Pérez",
    rol: "SDR",
    tipoAccion: "crear_universidad",
    entidad: "Universidad Autónoma de Guadalajara",
    entidadTipo: "universidad",
    canal: "manual",
    fechaHora: "2025-01-24T16:20:00Z",
  },
  {
    id: "8",
    usuario: "Diego Rodríguez",
    rol: "AE",
    tipoAccion: "deal_creado",
    entidad: "Pontificia Universidad Católica del Perú",
    entidadTipo: "deal",
    canal: "manual",
    fechaHora: "2025-01-24T15:00:00Z",
  },
  {
    id: "9",
    usuario: "María López",
    rol: "AE",
    tipoAccion: "correo_enviado",
    entidad: "USP - São Paulo",
    entidadTipo: "universidad",
    canal: "email",
    fechaHora: "2025-01-24T14:30:00Z",
  },
  {
    id: "10",
    usuario: "Carlos Mendoza",
    rol: "SDR",
    tipoAccion: "crear_lead",
    entidad: "ITESO",
    entidadTipo: "universidad",
    canal: "manual",
    fechaHora: "2025-01-24T11:00:00Z",
  },
  {
    id: "11",
    usuario: "Ana García",
    rol: "SDR",
    tipoAccion: "correo_enviado",
    entidad: "Universidad del Rosario",
    entidadTipo: "universidad",
    canal: "email",
    fechaHora: "2025-01-24T10:15:00Z",
  },
  {
    id: "12",
    usuario: "Juan Pérez",
    rol: "SDR",
    tipoAccion: "respuesta_recibida",
    entidad: "Universidad Iberoamericana",
    entidadTipo: "universidad",
    canal: "email",
    fechaHora: "2025-01-23T17:45:00Z",
  },
]

// Helper para calcular delta porcentual
export function calcularDelta(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0
  return Math.round(((actual - anterior) / anterior) * 100)
}

// Helper para obtener el color del delta
export function getDeltaColor(delta: number, invertido = false): string {
  if (delta === 0) return "text-muted-foreground"
  const esPositivo = invertido ? delta < 0 : delta > 0
  return esPositivo ? "text-green-600" : "text-red-600"
}

// Helper para formatear fecha
export function formatFechaHora(fecha: string): string {
  const date = new Date(fecha)
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper para obtener label de tipo de acción
export function getTipoAccionLabel(tipo: ActivityLog["tipoAccion"]): string {
  const labels: Record<ActivityLog["tipoAccion"], string> = {
    crear_universidad: "Creó universidad",
    crear_lead: "Creó lead",
    crear_kdm: "Creó KDM",
    correo_enviado: "Correo enviado",
    respuesta_recibida: "Respuesta recibida",
    reunion_agendada: "Reunión agendada",
    reunion_completada: "Reunión completada",
    deal_creado: "Deal creado",
    deal_ganado: "Deal ganado",
  }
  return labels[tipo]
}

// Helper para obtener color de tipo de acción
export function getTipoAccionColor(tipo: ActivityLog["tipoAccion"]): string {
  const colors: Record<ActivityLog["tipoAccion"], string> = {
    crear_universidad: "bg-blue-100 text-blue-800",
    crear_lead: "bg-purple-100 text-purple-800",
    crear_kdm: "bg-indigo-100 text-indigo-800",
    correo_enviado: "bg-sky-100 text-sky-800",
    respuesta_recibida: "bg-teal-100 text-teal-800",
    reunion_agendada: "bg-orange-100 text-orange-800",
    reunion_completada: "bg-green-100 text-green-800",
    deal_creado: "bg-yellow-100 text-yellow-800",
    deal_ganado: "bg-emerald-100 text-emerald-800",
  }
  return colors[tipo]
}
