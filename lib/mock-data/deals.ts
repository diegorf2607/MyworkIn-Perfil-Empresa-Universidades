// Mock data para el módulo Pipeline
// Representa deals/oportunidades en diferentes etapas del pipeline

export type DealStage = 
  | "primera_reunion_programada"
  | "primera_reunion_realizada"
  | "demo_programada"
  | "propuesta_enviada"
  | "negociacion"
  | "won"
  | "lost"
  | "nurture"

export type DealStatus = "activo" | "won" | "lost" | "nurture"

export type NextActionType = "llamada" | "email" | "reunion" | "demo" | "propuesta" | "seguimiento"

export type LastActivityType = "email" | "llamada" | "reunion" | "demo" | "nota"

export interface Deal {
  id: string
  accountId: string
  accountName: string
  country: string
  stage: DealStage
  ownerId: string
  ownerName: string
  ownerRole: "SDR" | "AE"
  ownerAvatar?: string
  mrr: number
  currency: "USD" | "ARS" | "BRL" | "CLP" | "COP" | "MXN"
  icpTier: "A" | "B" | "C"
  nextAction: {
    type: NextActionType
    date: string
    description: string
  } | null
  lastActivity: {
    type: LastActivityType
    date: string
    description: string
  } | null
  createdAt: string
  updatedAt: string
  expectedCloseDate: string | null
  probability: number
  status: DealStatus
  lostReason?: string
  source: "inbound" | "outbound" | "referido"
  stuckDays: number // días sin actividad
}

export interface DealColumn {
  key: DealStage
  label: string
  color: string
  bgColor: string
}

export const DEAL_COLUMNS: DealColumn[] = [
  { key: "primera_reunion_programada", label: "1ª Reunión Programada", color: "bg-sky-500", bgColor: "bg-sky-50" },
  { key: "primera_reunion_realizada", label: "1ª Reunión Realizada", color: "bg-blue-500", bgColor: "bg-blue-50" },
  { key: "demo_programada", label: "Demo / Deep Dive", color: "bg-violet-500", bgColor: "bg-violet-50" },
  { key: "propuesta_enviada", label: "Propuesta Enviada", color: "bg-amber-500", bgColor: "bg-amber-50" },
]

export const WON_COLUMN: DealColumn = {
  key: "won",
  label: "Won 🎉",
  color: "bg-emerald-500",
  bgColor: "bg-emerald-50",
}

export const LOST_COLUMN: DealColumn = {
  key: "lost",
  label: "Lost",
  color: "bg-red-500",
  bgColor: "bg-red-50",
}

export const NURTURE_COLUMN: DealColumn = {
  key: "nurture",
  label: "Nurture / En Pausa",
  color: "bg-slate-400",
  bgColor: "bg-slate-50",
}

// Función para calcular si una acción está vencida
export function isActionOverdue(date: string): boolean {
  return new Date(date) < new Date()
}

// Función para calcular si una acción es hoy
export function isActionToday(date: string): boolean {
  const actionDate = new Date(date).toDateString()
  const today = new Date().toDateString()
  return actionDate === today
}

// Función para formatear fecha relativa
export function getRelativeDate(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  return `Hace ${Math.floor(diffDays / 30)} meses`
}

// Mock team members
export const MOCK_TEAM = [
  { id: "user-1", name: "Carlos Martínez", role: "SDR" as const, avatar: null },
  { id: "user-2", name: "Ana García", role: "AE" as const, avatar: null },
  { id: "user-3", name: "Diego Rodríguez", role: "SDR" as const, avatar: null },
  { id: "user-4", name: "Laura Sánchez", role: "AE" as const, avatar: null },
  { id: "user-5", name: "Miguel López", role: "SDR" as const, avatar: null },
]

// Mock deals data
export const MOCK_DEALS: Deal[] = [
  // Primera reunión programada
  {
    id: "deal-1",
    accountId: "acc-1",
    accountName: "Universidad de Buenos Aires",
    country: "AR",
    stage: "primera_reunion_programada",
    ownerId: "user-1",
    ownerName: "Carlos Martínez",
    ownerRole: "SDR",
    mrr: 2500,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "reunion",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Discovery call con director de empleabilidad"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Confirmación de reunión"
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 20,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-2",
    accountId: "acc-2",
    accountName: "Pontificia Universidad Católica",
    country: "CL",
    stage: "primera_reunion_programada",
    ownerId: "user-3",
    ownerName: "Diego Rodríguez",
    ownerRole: "SDR",
    mrr: 3200,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "reunion",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // VENCIDA
      description: "Primera reunión pendiente de reagendar"
    },
    lastActivity: {
      type: "llamada",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Llamada de seguimiento"
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 15,
    status: "activo",
    source: "inbound",
    stuckDays: 3,
  },
  // Primera reunión realizada
  {
    id: "deal-3",
    accountId: "acc-3",
    accountName: "ITESM Campus Monterrey",
    country: "MX",
    stage: "primera_reunion_realizada",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 4500,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "demo",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Demo del producto con equipo técnico"
    },
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Discovery completado - muy interesados"
    },
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 40,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-4",
    accountId: "acc-4",
    accountName: "Universidad de São Paulo",
    country: "BR",
    stage: "primera_reunion_realizada",
    ownerId: "user-4",
    ownerName: "Laura Sánchez",
    ownerRole: "AE",
    mrr: 5800,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "email",
      date: new Date().toISOString(), // HOY
      description: "Enviar material adicional solicitado"
    },
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Discovery call - necesitan aprobación interna"
    },
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 35,
    status: "activo",
    source: "referido",
    stuckDays: 0,
  },
  // Demo programada
  {
    id: "deal-5",
    accountId: "acc-5",
    accountName: "Universidad de Los Andes",
    country: "CO",
    stage: "demo_programada",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 3800,
    currency: "USD",
    icpTier: "B",
    nextAction: {
      type: "demo",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Demo con comité de evaluación"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Confirmación asistentes demo"
    },
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 50,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-6",
    accountId: "acc-6",
    accountName: "Universidad Nacional de Córdoba",
    country: "AR",
    stage: "demo_programada",
    ownerId: "user-4",
    ownerName: "Laura Sánchez",
    ownerRole: "AE",
    mrr: 2100,
    currency: "USD",
    icpTier: "B",
    nextAction: {
      type: "demo",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // VENCIDA
      description: "Reagendar demo - conflicto de agenda"
    },
    lastActivity: {
      type: "llamada",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Llamada para confirmar demo"
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 45,
    status: "activo",
    source: "inbound",
    stuckDays: 5,
  },
  // Propuesta enviada
  {
    id: "deal-7",
    accountId: "acc-7",
    accountName: "Universidad del Desarrollo",
    country: "CL",
    stage: "propuesta_enviada",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 4200,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "seguimiento",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Llamada de seguimiento propuesta"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Propuesta comercial enviada"
    },
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 60,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-8",
    accountId: "acc-8",
    accountName: "UNAM",
    country: "MX",
    stage: "propuesta_enviada",
    ownerId: "user-4",
    ownerName: "Laura Sánchez",
    ownerRole: "AE",
    mrr: 6500,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "reunion",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Reunión para resolver dudas sobre propuesta"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Respuesta con consultas sobre pricing"
    },
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 55,
    status: "activo",
    source: "inbound",
    stuckDays: 0,
  },
  // Negociación
  {
    id: "deal-9",
    accountId: "acc-9",
    accountName: "Universidad Autónoma de México",
    country: "MX",
    stage: "negociacion",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 5200,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "reunion",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Reunión con legal para contrato"
    },
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Negociación de términos - avance positivo"
    },
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 75,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-10",
    accountId: "acc-10",
    accountName: "PUC-Rio",
    country: "BR",
    stage: "negociacion",
    ownerId: "user-4",
    ownerName: "Laura Sánchez",
    ownerRole: "AE",
    mrr: 4800,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "email",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // VENCIDA
      description: "Pendiente respuesta de procurement"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Envío de documentación legal"
    },
    createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 70,
    status: "activo",
    source: "referido",
    stuckDays: 7,
  },
  // Won
  {
    id: "deal-11",
    accountId: "acc-11",
    accountName: "Universidad Católica de Chile",
    country: "CL",
    stage: "won",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 4000,
    currency: "USD",
    icpTier: "A",
    nextAction: null,
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Firma de contrato completada"
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: null,
    probability: 100,
    status: "won",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-12",
    accountId: "acc-12",
    accountName: "Universidad de Guadalajara",
    country: "MX",
    stage: "won",
    ownerId: "user-4",
    ownerName: "Laura Sánchez",
    ownerRole: "AE",
    mrr: 3500,
    currency: "USD",
    icpTier: "B",
    nextAction: null,
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Kickoff completado"
    },
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: null,
    probability: 100,
    status: "won",
    source: "inbound",
    stuckDays: 0,
  },
  // Lost
  {
    id: "deal-13",
    accountId: "acc-13",
    accountName: "Universidad del Rosario",
    country: "CO",
    stage: "lost",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 2800,
    currency: "USD",
    icpTier: "B",
    nextAction: null,
    lastActivity: {
      type: "llamada",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Decisión final - eligieron competidor"
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: null,
    probability: 0,
    status: "lost",
    lostReason: "Eligieron competidor (precio)",
    source: "outbound",
    stuckDays: 0,
  },
  // Nurture
  {
    id: "deal-14",
    accountId: "acc-14",
    accountName: "Universidad Austral",
    country: "AR",
    stage: "nurture",
    ownerId: "user-1",
    ownerName: "Carlos Martínez",
    ownerRole: "SDR",
    mrr: 1800,
    currency: "USD",
    icpTier: "C",
    nextAction: {
      type: "email",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Seguimiento Q2 - sin presupuesto actualmente"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      description: "No hay presupuesto este año"
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: null,
    probability: 10,
    status: "nurture",
    source: "inbound",
    stuckDays: 20,
  },
  // Más deals para llenar el pipeline
  {
    id: "deal-15",
    accountId: "acc-15",
    accountName: "Universidad de Antioquia",
    country: "CO",
    stage: "primera_reunion_programada",
    ownerId: "user-5",
    ownerName: "Miguel López",
    ownerRole: "SDR",
    mrr: 2200,
    currency: "USD",
    icpTier: "B",
    nextAction: {
      type: "reunion",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Discovery call inicial"
    },
    lastActivity: {
      type: "email",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Confirmación de reunión"
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 20,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
  {
    id: "deal-16",
    accountId: "acc-16",
    accountName: "UNICAMP",
    country: "BR",
    stage: "primera_reunion_realizada",
    ownerId: "user-2",
    ownerName: "Ana García",
    ownerRole: "AE",
    mrr: 4100,
    currency: "USD",
    icpTier: "A",
    nextAction: {
      type: "propuesta",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Preparar propuesta comercial"
    },
    lastActivity: {
      type: "reunion",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Discovery completado - buen fit"
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    probability: 40,
    status: "activo",
    source: "outbound",
    stuckDays: 0,
  },
]

// Constantes para países
export const COUNTRY_FLAGS: Record<string, string> = {
  AR: "🇦🇷",
  BR: "🇧🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  MX: "🇲🇽",
}

export const COUNTRY_NAMES: Record<string, string> = {
  AR: "Argentina",
  BR: "Brasil",
  CL: "Chile",
  CO: "Colombia",
  MX: "México",
}

// Funciones de utilidad para cálculos
export function calculateColumnStats(deals: Deal[], stage: DealStage) {
  const columnDeals = deals.filter(d => d.stage === stage)
  const totalMrr = columnDeals.reduce((sum, d) => sum + d.mrr, 0)
  const overdueCount = columnDeals.filter(d => 
    d.nextAction && isActionOverdue(d.nextAction.date)
  ).length
  
  return {
    count: columnDeals.length,
    totalMrr,
    overdueCount,
  }
}

export function getDealsGroupedByStage(deals: Deal[]): Record<DealStage, Deal[]> {
  const grouped: Record<DealStage, Deal[]> = {
    primera_reunion_programada: [],
    primera_reunion_realizada: [],
    demo_programada: [],
    propuesta_enviada: [],
    negociacion: [],
    won: [],
    lost: [],
    nurture: [],
  }
  
  deals.forEach(deal => {
    grouped[deal.stage].push(deal)
  })
  
  return grouped
}

// Lost reasons predefinidas
export const LOST_REASONS = [
  "Eligieron competidor (precio)",
  "Eligieron competidor (funcionalidad)",
  "Sin presupuesto",
  "Timing - posponiendo decisión",
  "No responde / ghosting",
  "Cambio de prioridades internas",
  "Contacto clave dejó la empresa",
  "Otro",
]
