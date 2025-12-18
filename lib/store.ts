import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Country,
  UniversityAccount,
  Contact,
  Opportunity,
  Activity,
  Meeting,
  Sequence,
  ResourceLink,
  ScorecardEntry,
  Task,
  TeamMember,
  GlossaryTerm,
  QuickLink,
  SetupTargets,
} from "./types"

interface AppState {
  // App State
  appInitialized: boolean
  currentCountryCode: string | null
  dateRange: "14d" | "30d"

  // Entities
  countries: Country[]
  accounts: UniversityAccount[]
  contacts: Contact[]
  opportunities: Opportunity[]
  activities: Activity[]
  meetings: Meeting[]
  sequences: Sequence[]
  resources: ResourceLink[]
  scorecardEntries: ScorecardEntry[]
  tasks: Task[]
  teamMembers: TeamMember[]
  glossaryTerms: GlossaryTerm[]
  quickLinks: QuickLink[]
  targets: SetupTargets

  // Actions
  setAppInitialized: (value: boolean) => void
  setCurrentCountryCode: (code: string | null) => void
  setDateRange: (range: "14d" | "30d") => void
  setActiveCountries: (codes: string[]) => void
  addCountry: (country: Country) => void
  updateCountry: (code: string, updates: Partial<Country>) => void
  deleteCountry: (code: string) => void

  // CRUD Actions
  addAccount: (account: UniversityAccount) => void
  updateAccount: (id: string, updates: Partial<UniversityAccount>) => void
  deleteAccount: (id: string) => void

  addContact: (contact: Contact) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void

  addOpportunity: (opp: Opportunity) => void
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void
  deleteOpportunity: (id: string) => void

  addActivity: (activity: Activity) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void

  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void

  addSequence: (sequence: Sequence) => void
  updateSequence: (id: string, updates: Partial<Sequence>) => void
  deleteSequence: (id: string) => void

  addResource: (resource: ResourceLink) => void
  updateResource: (id: string, updates: Partial<ResourceLink>) => void
  deleteResource: (id: string) => void

  addScorecardEntry: (entry: ScorecardEntry) => void
  updateScorecardEntry: (id: string, updates: Partial<ScorecardEntry>) => void

  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  addTeamMember: (member: TeamMember) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  deleteTeamMember: (id: string) => void

  addGlossaryTerm: (term: GlossaryTerm) => void
  updateGlossaryTerm: (id: string, updates: Partial<GlossaryTerm>) => void
  deleteGlossaryTerm: (id: string) => void

  addQuickLink: (link: QuickLink) => void
  updateQuickLink: (id: string, updates: Partial<QuickLink>) => void
  deleteQuickLink: (id: string) => void

  setTargets: (targets: SetupTargets) => void

  seedInitialData: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 11)

const defaultCountries: Country[] = [
  { code: "PE", name: "Perú", active: false },
  { code: "MX", name: "México", active: false },
  { code: "CO", name: "Colombia", active: false },
  { code: "CL", name: "Chile", active: false },
  { code: "EC", name: "Ecuador", active: false },
  { code: "GT", name: "Guatemala", active: false },
  { code: "AR", name: "Argentina", active: false },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      appInitialized: false,
      currentCountryCode: null,
      dateRange: "14d",

      countries: defaultCountries,
      accounts: [],
      contacts: [],
      opportunities: [],
      activities: [],
      meetings: [],
      sequences: [],
      resources: [],
      scorecardEntries: [],
      tasks: [],
      teamMembers: [],
      glossaryTerms: [],
      quickLinks: [],
      targets: {
        mrrTarget: 50000,
        universitiesTarget: 20,
        sqlsTarget: 50,
        meetingsTarget: 100,
      },

      // Setters
      setAppInitialized: (value) => set({ appInitialized: value }),
      setCurrentCountryCode: (code) => set({ currentCountryCode: code }),
      setDateRange: (range) => set({ dateRange: range }),
      setActiveCountries: (codes) =>
        set({
          countries: get().countries.map((c) => ({
            ...c,
            active: codes.includes(c.code),
          })),
        }),

      addCountry: (country) => set({ countries: [...get().countries, country] }),
      updateCountry: (code, updates) =>
        set({
          countries: get().countries.map((c) => (c.code === code ? { ...c, ...updates } : c)),
        }),
      deleteCountry: (code) => set({ countries: get().countries.filter((c) => c.code !== code) }),

      // Account CRUD
      addAccount: (account) => set({ accounts: [...get().accounts, account] }),
      updateAccount: (id, updates) =>
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }),
      deleteAccount: (id) => set({ accounts: get().accounts.filter((a) => a.id !== id) }),

      // Contact CRUD
      addContact: (contact) => set({ contacts: [...get().contacts, contact] }),
      updateContact: (id, updates) =>
        set({
          contacts: get().contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }),
      deleteContact: (id) => set({ contacts: get().contacts.filter((c) => c.id !== id) }),

      // Opportunity CRUD
      addOpportunity: (opp) => set({ opportunities: [...get().opportunities, opp] }),
      updateOpportunity: (id, updates) =>
        set({
          opportunities: get().opportunities.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        }),
      deleteOpportunity: (id) => set({ opportunities: get().opportunities.filter((o) => o.id !== id) }),

      // Activity CRUD
      addActivity: (activity) => set({ activities: [...get().activities, activity] }),
      updateActivity: (id, updates) =>
        set({
          activities: get().activities.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }),
      deleteActivity: (id) => set({ activities: get().activities.filter((a) => a.id !== id) }),

      // Meeting CRUD
      addMeeting: (meeting) => set({ meetings: [...get().meetings, meeting] }),
      updateMeeting: (id, updates) =>
        set({
          meetings: get().meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }),
      deleteMeeting: (id) => set({ meetings: get().meetings.filter((m) => m.id !== id) }),

      // Sequence CRUD
      addSequence: (sequence) => set({ sequences: [...get().sequences, sequence] }),
      updateSequence: (id, updates) =>
        set({
          sequences: get().sequences.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }),
      deleteSequence: (id) => set({ sequences: get().sequences.filter((s) => s.id !== id) }),

      // Resource CRUD
      addResource: (resource) => set({ resources: [...get().resources, resource] }),
      updateResource: (id, updates) =>
        set({
          resources: get().resources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }),
      deleteResource: (id) => set({ resources: get().resources.filter((r) => r.id !== id) }),

      // Scorecard CRUD
      addScorecardEntry: (entry) => set({ scorecardEntries: [...get().scorecardEntries, entry] }),
      updateScorecardEntry: (id, updates) =>
        set({
          scorecardEntries: get().scorecardEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }),

      // Task CRUD
      addTask: (task) => set({ tasks: [...get().tasks, task] }),
      updateTask: (id, updates) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }),
      deleteTask: (id) => set({ tasks: get().tasks.filter((t) => t.id !== id) }),

      // Team Member CRUD
      addTeamMember: (member) => set({ teamMembers: [...get().teamMembers, member] }),
      updateTeamMember: (id, updates) =>
        set({
          teamMembers: get().teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }),
      deleteTeamMember: (id) => set({ teamMembers: get().teamMembers.filter((m) => m.id !== id) }),

      // Glossary CRUD
      addGlossaryTerm: (term) => set({ glossaryTerms: [...get().glossaryTerms, term] }),
      updateGlossaryTerm: (id, updates) =>
        set({
          glossaryTerms: get().glossaryTerms.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }),
      deleteGlossaryTerm: (id) => set({ glossaryTerms: get().glossaryTerms.filter((t) => t.id !== id) }),

      // Quick Link CRUD
      addQuickLink: (link) => set({ quickLinks: [...get().quickLinks, link] }),
      updateQuickLink: (id, updates) =>
        set({
          quickLinks: get().quickLinks.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        }),
      deleteQuickLink: (id) => set({ quickLinks: get().quickLinks.filter((l) => l.id !== id) }),

      setTargets: (targets) => set({ targets }),

      // Seed Initial Data
      seedInitialData: () => {
        const activeCountries = ["PE", "MX", "CO"]
        const teamMembers: TeamMember[] = [
          { id: generateId(), name: "Carlos Mendoza", email: "carlos@myworkin.com", role: "AE" },
          { id: generateId(), name: "María García", email: "maria@myworkin.com", role: "SDR" },
          { id: generateId(), name: "Juan López", email: "juan@myworkin.com", role: "SDR" },
          { id: generateId(), name: "Ana Torres", email: "ana@myworkin.com", role: "AE" },
        ]

        const universities = {
          PE: [
            { name: "Universidad de Lima", city: "Lima", type: "privada" as const },
            { name: "PUCP", city: "Lima", type: "privada" as const },
            { name: "UPC", city: "Lima", type: "privada" as const },
            { name: "Universidad San Martín", city: "Lima", type: "privada" as const },
            { name: "Universidad del Pacífico", city: "Lima", type: "privada" as const },
            { name: "UNMSM", city: "Lima", type: "pública" as const },
            { name: "UNI", city: "Lima", type: "pública" as const },
            { name: "Universidad de Piura", city: "Piura", type: "privada" as const },
          ],
          MX: [
            { name: "ITESM", city: "Monterrey", type: "privada" as const },
            { name: "UNAM", city: "Ciudad de México", type: "pública" as const },
            { name: "Universidad Iberoamericana", city: "Ciudad de México", type: "privada" as const },
            { name: "ITAM", city: "Ciudad de México", type: "privada" as const },
            { name: "Universidad Anáhuac", city: "Ciudad de México", type: "privada" as const },
            { name: "UAM", city: "Ciudad de México", type: "pública" as const },
            { name: "Universidad de Guadalajara", city: "Guadalajara", type: "pública" as const },
          ],
          CO: [
            { name: "Universidad de los Andes", city: "Bogotá", type: "privada" as const },
            { name: "Universidad Javeriana", city: "Bogotá", type: "privada" as const },
            { name: "Universidad Nacional", city: "Bogotá", type: "pública" as const },
            { name: "Universidad del Rosario", city: "Bogotá", type: "privada" as const },
            { name: "EAFIT", city: "Medellín", type: "privada" as const },
            { name: "Universidad de Antioquia", city: "Medellín", type: "pública" as const },
          ],
        }

        const stages = ["lead", "sql", "opp", "won", "lost"] as const
        const sources = ["inbound", "outbound", "referral", "evento"] as const

        const accounts: UniversityAccount[] = []
        const contacts: Contact[] = []
        const opportunities: Opportunity[] = []
        const activities: Activity[] = []
        const meetings: Meeting[] = []

        activeCountries.forEach((countryCode) => {
          const countryUnis = universities[countryCode as keyof typeof universities] || []
          countryUnis.forEach((uni, idx) => {
            const accountId = generateId()
            const stage = stages[idx % 5]
            const ownerId = teamMembers[idx % teamMembers.length].id

            accounts.push({
              id: accountId,
              countryCode,
              name: uni.name,
              city: uni.city,
              type: uni.type,
              website: `https://${uni.name.toLowerCase().replace(/\s+/g, "")}.edu`,
              size: idx % 3 === 0 ? "grande" : idx % 2 === 0 ? "mediana" : "pequeña",
              ownerId,
              icpFit: 60 + Math.floor(Math.random() * 40),
              stage,
              source: sources[idx % 4],
              lastTouch: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              nextAction: "Seguimiento",
              nextActionDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              probability: stage === "won" ? 100 : stage === "lost" ? 0 : 20 + idx * 10,
              mrr: 1000 + idx * 500,
              status: "activo",
              notes: `Universidad ${uni.type} en ${uni.city}`,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            })

            // Add contacts
            contacts.push({
              id: generateId(),
              accountId,
              name: `Director ${uni.name.split(" ")[0]}`,
              role: "KDM",
              title: "Director de Empleabilidad",
              email: `director@${uni.name.toLowerCase().replace(/\s+/g, "")}.edu`,
              whatsapp: "+51999999999",
            })

            // Add opportunities for SQL and OPP stages
            if (["sql", "opp", "won", "lost"].includes(stage)) {
              opportunities.push({
                id: generateId(),
                accountId,
                countryCode,
                product: "MyWorkIn (integral)",
                stage: stage === "sql" ? "discovery" : stage === "opp" ? "propuesta" : (stage as "won" | "lost"),
                probability: stage === "won" ? 100 : stage === "lost" ? 0 : 50,
                mrr: 1000 + idx * 500,
                nextStep: "Presentar propuesta final",
                nextStepDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                lostReason: stage === "lost" ? "Presupuesto" : undefined,
                closedAt: ["won", "lost"].includes(stage) ? new Date().toISOString() : undefined,
              })
            }

            // Add activities
            activities.push({
              id: generateId(),
              countryCode,
              accountId,
              type: "email",
              dateTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              ownerId,
              summary: `Email de seguimiento enviado a ${uni.name}`,
            })

            // Add meetings for some accounts
            if (idx % 2 === 0) {
              meetings.push({
                id: generateId(),
                countryCode,
                accountId,
                dateTime: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
                kind: idx % 4 === 0 ? "Discovery" : idx % 4 === 1 ? "Demo" : idx % 4 === 2 ? "Propuesta" : "Kickoff",
                ownerId,
                outcome: "pending",
                notes: "",
                nextStep: "Preparar demo personalizada",
                nextMeetingDate: "",
              })
            }
          })
        })

        // Seed sequences
        const sequences: Sequence[] = [
          {
            id: generateId(),
            countryCode: "PE",
            channel: "email",
            name: "Secuencia Discovery Perú",
            steps: [
              {
                id: generateId(),
                order: 1,
                content: "Hola {nombre}, vi que {universidad} está buscando mejorar la empleabilidad...",
                delay: "Día 1",
              },
              {
                id: generateId(),
                order: 2,
                content: "Seguimiento: ¿Pudiste revisar la información que te envié?",
                delay: "Día 3",
              },
              {
                id: generateId(),
                order: 3,
                content: "Último intento: Me encantaría mostrarte cómo otras universidades...",
                delay: "Día 7",
              },
            ],
          },
          {
            id: generateId(),
            countryCode: "MX",
            channel: "linkedin",
            name: "Secuencia LinkedIn México",
            steps: [
              {
                id: generateId(),
                order: 1,
                content: "Hola {nombre}, trabajo en MyWorkIn y me gustaría conectar...",
                delay: "Día 1",
              },
              {
                id: generateId(),
                order: 2,
                content: "Gracias por conectar. ¿Te gustaría conocer cómo ayudamos a universidades?",
                delay: "Día 2",
              },
            ],
          },
        ]

        // Seed resources
        const resources: ResourceLink[] = [
          {
            id: generateId(),
            countryCode: "PE",
            category: "decks",
            title: "Deck Comercial 2025",
            description: "Presentación principal de ventas",
            url: "https://docs.google.com/presentation/deck-comercial",
            ownerId: teamMembers[0].id,
            updatedAt: new Date().toISOString(),
          },
          {
            id: generateId(),
            countryCode: "PE",
            category: "casos",
            title: "Caso PUCP",
            description: "Caso de éxito implementación PUCP",
            url: "https://docs.google.com/docs/caso-pucp",
            ownerId: teamMembers[0].id,
            updatedAt: new Date().toISOString(),
          },
          {
            id: generateId(),
            countryCode: "MX",
            category: "objeciones",
            title: "Manejo de Objeciones",
            description: "Guía para manejar objeciones comunes",
            url: "https://docs.google.com/docs/objeciones",
            ownerId: teamMembers[1].id,
            updatedAt: new Date().toISOString(),
          },
          {
            id: generateId(),
            countryCode: "CO",
            category: "looms",
            title: "Demo Producto",
            description: "Video demo del producto",
            url: "https://loom.com/demo",
            ownerId: teamMembers[2].id,
            updatedAt: new Date().toISOString(),
          },
        ]

        // Seed scorecard entries (last 14 days)
        const scorecardEntries: ScorecardEntry[] = []
        for (let i = 0; i < 14; i++) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          activeCountries.forEach((countryCode) => {
            scorecardEntries.push({
              id: generateId(),
              countryCode,
              date: date.toISOString().split("T")[0],
              cashCollected: Math.floor(Math.random() * 5000),
              mrrGenerated: Math.floor(Math.random() * 3000),
              universitiesWon: Math.floor(Math.random() * 2),
              newSQLs: Math.floor(Math.random() * 5),
              meetingsDone: Math.floor(Math.random() * 4),
              newICPAccounts: Math.floor(Math.random() * 3),
            })
          })
        }

        // Seed tasks
        const tasks: Task[] = [
          {
            id: generateId(),
            countryCode: "PE",
            title: "Enviar propuesta a PUCP",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
          },
          {
            id: generateId(),
            countryCode: "MX",
            title: "Preparar demo para ITESM",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
          },
          {
            id: generateId(),
            countryCode: "CO",
            title: "Seguimiento Universidad de los Andes",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending",
          },
        ]

        // Seed glossary
        const glossaryTerms: GlossaryTerm[] = [
          {
            id: generateId(),
            term: "ICP",
            definition: "Ideal Customer Profile - Perfil del cliente ideal",
            category: "Ventas",
          },
          {
            id: generateId(),
            term: "SQL",
            definition: "Sales Qualified Lead - Lead calificado para ventas",
            category: "Ventas",
          },
          {
            id: generateId(),
            term: "MRR",
            definition: "Monthly Recurring Revenue - Ingreso mensual recurrente",
            category: "Métricas",
          },
          {
            id: generateId(),
            term: "KDM",
            definition: "Key Decision Maker - Tomador de decisiones clave",
            category: "Contactos",
          },
          {
            id: generateId(),
            term: "Discovery",
            definition: "Primera reunión para entender necesidades del cliente",
            category: "Proceso",
          },
        ]

        // Seed quick links
        const quickLinks: QuickLink[] = [
          { id: generateId(), title: "Deck Principal", url: "https://docs.google.com/deck", category: "Ventas" },
          {
            id: generateId(),
            title: "Scripts de Llamadas",
            url: "https://docs.google.com/scripts",
            category: "Ventas",
          },
          { id: generateId(), title: "CRM Legacy", url: "https://crm.myworkin.com", category: "Herramientas" },
        ]

        set({
          countries: defaultCountries.map((c) => ({
            ...c,
            active: activeCountries.includes(c.code),
          })),
          accounts,
          contacts,
          opportunities,
          activities,
          meetings,
          sequences,
          resources,
          scorecardEntries,
          tasks,
          teamMembers,
          glossaryTerms,
          quickLinks,
        })
      },
    }),
    {
      name: "myworkin-crm-storage",
    },
  ),
)
