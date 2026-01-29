// Configuración de Workspaces para Multi-CRM
// MyWorkIn (universidades) + MKN Technologies (empresas/IA)

export type WorkspaceId = "myworkin" | "mkn"

// Contenido del Overview por workspace
export interface OverviewContent {
  banner: {
    title: string
    subtitle: string
    defaultSubtitle: string
  }
  summary: {
    header: string
    title: string
    body: string
  }
  whatWeDo: {
    title: string
    cards: {
      title: string
      bullets: string[]
    }[]
  }
  northStar: {
    title: string
    description: string
    defaultText: string
  }
}

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
  overview: OverviewContent
}

export interface WorkspaceTerminology {
  // Entidad principal
  entity: string // "Universidad" | "Empresa"
  entities: string // "Universidades" | "Empresas"
  entityShort: string // "Unis" | "Empresas"
  
  // Base de datos
  databaseTitle: string // "Base de Universidades" | "Base de Empresas"
  
  // Leads
  leadsTitle: string // "Leads (ICP)" | "Leads"
  leadsSubtitle: string
  
  // Búsqueda
  searchPlaceholder: string
  searchEntityPlaceholder: string // "Buscar universidad..." | "Buscar empresa..."
  selectEntityPlaceholder: string // "Seleccionar universidad" | "Seleccionar empresa"
  
  // Cerradas
  closedTitle: string // "Universidades Cerradas" | "Cuentas Cerradas"
  wonLabel: string // "Unis Won" | "Empresas Won"
  entitiesWon: string // "Universidades Won" | "Empresas Won"
  entitiesClosed: string // "Universidades Cerradas" | "Empresas Cerradas"
  
  // Tipo (pública/privada vs Industria)
  typeLabel: string
  typeOptions: { value: string; label: string }[]
  
  // Tamaño
  sizeLabel: string
  sizeOptions: { value: string; label: string }[]
  
  // Sidebar labels
  funnelLeads: string // "Leads (ICP)" | "Leads"
  funnelWon: string // "Cerradas Won" | "Clientes"
  
  // Reuniones
  meetingWith: string // "Reunión con universidad" | "Reunión con empresa"
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
    entityShort: "Unis",
    databaseTitle: "Base de Universidades",
    leadsTitle: "Leads (ICP)",
    leadsSubtitle: "Universidades que encajan con nuestro cliente ideal",
    searchPlaceholder: "Buscar universidades, contactos...",
    searchEntityPlaceholder: "Buscar universidad...",
    selectEntityPlaceholder: "Seleccionar universidad",
    closedTitle: "Universidades Cerradas",
    wonLabel: "Unis Won",
    entitiesWon: "Universidades Won",
    entitiesClosed: "Universidades Cerradas",
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
    funnelLeads: "Leads (ICP)",
    funnelWon: "Cerradas Won",
    meetingWith: "Reunión con universidad",
  },
  overview: {
    banner: {
      title: "Somos el equipo de crecimiento de MyWorkIn",
      subtitle: "Responsables de diseñar y ejecutar, con apoyo de inteligencia artificial, las palancas que harán crecer el negocio 30x.",
      defaultSubtitle: "Impulsamos la empleabilidad universitaria en LATAM conectando estudiantes con oportunidades reales.",
    },
    summary: {
      header: "Resumen Ejecutivo",
      title: "Quiénes somos",
      body: "MyWorkIn es una plataforma de empleabilidad para universidades. Ayudamos a conectar a sus estudiantes/egresados con oportunidades laborales y ofrecemos a las instituciones bolsas de trabajo, herramientas de IA y la automatización de procesos internos.",
    },
    whatWeDo: {
      title: "Qué hacemos",
      cards: [
        {
          title: "Para estudiantes y egresados",
          bullets: [
            "Bolsa de trabajo con match",
            "Herramientas de IA (CV, Entrevistas, LinkedIn y Aprendizaje)",
            "Solicitud de documentos / asesorías",
          ],
        },
        {
          title: "Para universidades",
          bullets: [
            "Procesos académicos y administrativos",
            "Vínculo institucional y trazabilidad",
            "Difusión de oportunidades y análisis de datos",
          ],
        },
      ],
    },
    northStar: {
      title: "North Star 2026",
      description: "Nuestra visión y objetivos principales",
      defaultText: "Ser la plataforma líder de empleabilidad universitaria en LATAM, conectando a 200+ universidades y alcanzando 1M+ estudiantes y egresados para transformar su futuro profesional.",
    },
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
    logo: "/images/myworkin-icon-white.png", // Usando logo blanco existente
    logoWhite: "/images/myworkin-icon-white.png", // Usando logo blanco existente
  },
  terminology: {
    entity: "Empresa",
    entities: "Empresas",
    entityShort: "Empresas",
    databaseTitle: "Base de Empresas",
    leadsTitle: "Leads",
    leadsSubtitle: "Empresas que encajan con nuestro cliente ideal",
    searchPlaceholder: "Buscar empresas, contactos...",
    searchEntityPlaceholder: "Buscar empresa...",
    selectEntityPlaceholder: "Seleccionar empresa",
    closedTitle: "Empresas Cerradas",
    wonLabel: "Empresas Won",
    entitiesWon: "Empresas Won",
    entitiesClosed: "Empresas Cerradas",
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
      { value: "pequeña", label: "Pequeña" },
      { value: "mediana", label: "Mediana" },
      { value: "grande", label: "Grande" },
    ],
    funnelLeads: "Leads",
    funnelWon: "Clientes",
    meetingWith: "Reunión con empresa",
  },
  overview: {
    banner: {
      title: "Implementamos IA con impacto real",
      subtitle: "MKN Technologies ayuda a equipos pequeños y empresas medianas a llevar IA a producción con claridad, velocidad y entrenamiento práctico.",
      defaultSubtitle: "MKN Technologies ayuda a equipos pequeños y empresas medianas a llevar IA a producción con claridad, velocidad y entrenamiento práctico.",
    },
    summary: {
      header: "Qué es MKN",
      title: "Quiénes somos",
      body: "MKN Technologies combina implementación de IA con capacitación para que tu equipo pueda operar, mejorar y escalar lo que construimos. Priorizamos soluciones productivas, iteración rápida y uso responsable de datos.",
    },
    whatWeDo: {
      title: "Qué hacemos",
      cards: [
        {
          title: "Implementación de IA",
          bullets: [
            "Diseño y despliegue de soluciones de IA integradas a tus herramientas y workflows",
            "Automatización y optimización de procesos (menos trabajo manual, más velocidad)",
            "Analítica e insights para mejorar decisiones (cuando aplique)",
          ],
        },
        {
          title: "Estrategia y habilitación",
          bullets: [
            "Roadmap y casos de uso de alto impacto con métricas claras",
            "Workshops y training hands-on para adopción real",
            "Acompañamiento para operación y mejora continua (no dependencia)",
          ],
        },
      ],
    },
    northStar: {
      title: "North Star 2026",
      description: "Nuestra visión y objetivos principales",
      defaultText: "Habilitar a 100+ organizaciones a implementar IA en producción y entrenar a sus equipos para operar y escalar soluciones de forma autónoma.",
    },
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
