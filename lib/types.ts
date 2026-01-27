export interface Country {
  code: string
  name: string
  active: boolean
}

export interface UniversityAccount {
  id: string
  countryCode: string
  name: string
  city: string
  type: "privada" | "pública"
  website: string
  size: "pequeña" | "mediana" | "grande"
  ownerId: string
  icpFit: number
  stage: "lead" | "sql" | "opp" | "won" | "lost"
  source: "inbound" | "outbound" | "referral" | "evento"
  lastTouch: string
  nextAction: string
  nextActionDate: string
  probability: number
  mrr: number
  status: "activo" | "pausado" | "archivado"
  notes: string
  createdAt: string
}

export interface Contact {
  id: string
  accountId: string
  name: string
  role: "KDM" | "influencer" | "procurement"
  title: string
  email: string
  whatsapp: string
}

export interface Opportunity {
  id: string
  accountId: string
  countryCode: string
  product: "MyWorkIn (integral)"
  stage: "discovery" | "demo" | "propuesta" | "negociacion" | "won" | "lost"
  probability: number
  mrr: number
  nextStep: string
  nextStepDate: string
  lostReason?: string
  createdAt: string
  closedAt?: string
}

export interface Activity {
  id: string
  countryCode: string
  accountId: string
  type: "email" | "llamada" | "reunión" | "nota" | "linkedin" | "whatsapp"
  dateTime: string
  ownerId: string
  summary: string
}

export interface Meeting {
  id: string
  countryCode: string
  accountId: string
  dateTime: string
  kind: "Discovery" | "Demo" | "Propuesta" | "Kickoff"
  ownerId: string
  outcome: "pending" | "no-show" | "done" | "next-step"
  notes: string
  nextStep: string
  nextMeetingDate: string
}

export interface SequenceStep {
  id: string
  order: number
  content: string
  delay: string
}

export interface Sequence {
  id: string
  countryCode: string
  channel: "email" | "linkedin" | "whatsapp"
  name: string
  steps: SequenceStep[]
}

export interface ResourceLink {
  id: string
  countryCode: string
  category: "decks" | "casos" | "objeciones" | "pricing" | "looms" | "legal" | "implementacion"
  title: string
  description: string
  url: string
  ownerId: string
  updatedAt: string
}

export interface ScorecardEntry {
  id: string
  countryCode: string
  date: string
  cashCollected: number
  mrrGenerated: number
  universitiesWon: number
  newSQLs: number
  meetingsDone: number
  newICPAccounts: number
}

export interface Task {
  id: string
  countryCode: string
  title: string
  accountId?: string
  dueDate: string
  status: "pending" | "completed"
}

export interface TeamMember {
  id: string
  user_id?: string // References auth.users
  name: string
  email: string
  role: "admin" | "user" // System role
  sales_role?: "SDR" | "AE" // Sales role
  country_codes?: string[] // Array of assigned countries
  is_active?: boolean
  created_at?: string
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  category: string
}

export interface QuickLink {
  id: string
  title: string
  url: string
  category: string
}

export interface SetupTargets {
  mrrTarget: number
  universitiesTarget: number
  sqlsTarget: number
  meetingsTarget: number
}
