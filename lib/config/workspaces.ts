// Configuración de Workspaces para Multi-CRM
// MyWorkIn (universidades) + MKN Technologies (empresas/IA)

export type WorkspaceId = "myworkin" | "mkn"

export interface WorkspaceConfig {
  id: WorkspaceId
  displayName: string
  shortName: string
  tagline: string
  description: string
  theme: {
    primary: string
    primaryForeground: string
    accent: string
    sidebar: string
    sidebarForeground: string
    sidebarAccent: string
    logo: string
    logoWhite: string
  }
  terminology: WorkspaceTerminology
}

export interface WorkspaceTerminology {
  // Entidad principal
  entity: string // "Universidad" | "Cuenta"
  entities: string // "Universidades" | "Cuentas"
  entityShort: string // "UNIS" | "Cuentas"
  
  // Base de datos
  databaseTitle: string // "Base de Universidades" | "Base de Cuentas"
  
  // Leads
  leadsSubtitle: string
  
  // Búsqueda
  searchPlaceholder: string
  
  // Cerradas
  closedTitle: string
  wonLabel: string
  
  // Tipo (pública/privada vs SMB/Enterprise)
  typeLabel: string
  typeOptions: { value: string; label: string }[]
  
  // Tamaño
  sizeLabel: string
  sizeOptions: { value: string; label: string }[]
}

// Configuración de MyWorkIn (CRM Universidades)
export const MYWORKIN_CONFIG: WorkspaceConfig = {
  id: "myworkin",
  displayName: "MyWorkIn CRM",
  shortName: "MyWorkIn",
  tagline: "CRM para universidades",
  description: "Impulsamos la empleabilidad universitaria en LATAM conectando estudiantes con oportunidades reales.",
  theme: {
    primary: "#005691",
    primaryForeground: "#ffffff",
    accent: "#0077cc",
    sidebar: "#005691",
    sidebarForeground: "#ffffff",
    sidebarAccent: "#0077cc",
    logo: "/images/myworkin-logo.png",
    logoWhite: "/images/myworkin-icon-white.png",
  },
  terminology: {
    entity: "Universidad",
    entities: "Universidades",
    entityShort: "UNIS",
    databaseTitle: "Base de Universidades",
    leadsSubtitle: "Universidades que encajan con nuestro cliente ideal",
    searchPlaceholder: "Buscar universidades, contactos...",
    closedTitle: "Universidades Cerradas",
    wonLabel: "Unis Won",
    typeLabel: "Tipo",
    typeOptions: [
      { value: "privada", label: "Privada" },
      { value: "pública", label: "Pública" },
    ],
    sizeLabel: "Tamaño",
    sizeOptions: [
      { value: "pequeña", label: "Pequeña" },
      { value: "mediana", label: "Mediana" },
      { value: "grande", label: "Grande" },
    ],
  },
}

// Configuración de MKN Technologies (CRM Empresas/IA)
export const MKN_CONFIG: WorkspaceConfig = {
  id: "mkn",
  displayName: "MKN Technologies",
  shortName: "MKN",
  tagline: "AI implementation + training for real business impact",
  description: "MKN Technologies helps organizations adopt AI with clarity and speed. We deliver production-ready AI solutions and hands-on training so teams can run and scale what we build.",
  theme: {
    primary: "#000000",
    primaryForeground: "#ffffff",
    accent: "#333333",
    sidebar: "#000000",
    sidebarForeground: "#ffffff",
    sidebarAccent: "#333333",
    logo: "/images/mkn-logo.png", // Placeholder - reemplazar luego
    logoWhite: "/images/mkn-logo-white.png", // Placeholder - reemplazar luego
  },
  terminology: {
    entity: "Cuenta",
    entities: "Cuentas",
    entityShort: "Cuentas",
    databaseTitle: "Base de Cuentas",
    leadsSubtitle: "Cuentas que encajan con nuestro cliente ideal",
    searchPlaceholder: "Buscar cuentas, contactos...",
    closedTitle: "Cuentas Cerradas",
    wonLabel: "Cuentas ganadas",
    typeLabel: "Industria",
    typeOptions: [
      { value: "tecnologia", label: "Tecnología" },
      { value: "finanzas", label: "Finanzas" },
      { value: "salud", label: "Salud" },
      { value: "retail", label: "Retail" },
      { value: "manufactura", label: "Manufactura" },
      { value: "servicios", label: "Servicios" },
      { value: "otro", label: "Otro" },
    ],
    sizeLabel: "Tamaño",
    sizeOptions: [
      { value: "smb", label: "SMB" },
      { value: "mid", label: "Mid-Market" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
}

// Mapa de workspaces
export const WORKSPACES: Record<WorkspaceId, WorkspaceConfig> = {
  myworkin: MYWORKIN_CONFIG,
  mkn: MKN_CONFIG,
}

// Workspace por defecto
export const DEFAULT_WORKSPACE: WorkspaceId = "myworkin"

// Helper para obtener configuración
export function getWorkspaceConfig(workspaceId: WorkspaceId): WorkspaceConfig {
  return WORKSPACES[workspaceId] || MYWORKIN_CONFIG
}

// Helper para validar workspace ID
export function isValidWorkspace(id: string): id is WorkspaceId {
  return id === "myworkin" || id === "mkn"
}
