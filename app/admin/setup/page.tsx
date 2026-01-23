"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import { Check, ChevronRight, Globe, Users, Target } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const { countries, setActiveCountries, setAppInitialized, addTeamMember, setTargets, addQuickLink, seedInitialData } =
    useAppStore()

  const [step, setStep] = useState(1)
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["PE", "MX", "CO"])

  // Team members state
  const [teamMembers, setTeamMembers] = useState([
    { name: "Carlos Mendoza", email: "carlos@myworkin.com", role: "AE" as const },
    { name: "María García", email: "maria@myworkin.com", role: "SDR" as const },
  ])
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "SDR" as "SDR" | "AE" })

  // Targets state
  const [targets, setLocalTargets] = useState({
    mrrTarget: "50000",
    universitiesTarget: "20",
    sqlsTarget: "50",
    meetingsTarget: "100",
  })

  // Quick links state
  const [quickLinks, setQuickLinks] = useState([
    { title: "Deck Principal", url: "https://docs.google.com/deck", category: "Ventas" },
    { title: "Scripts de Llamadas", url: "https://docs.google.com/scripts", category: "Ventas" },
    { title: "Objeciones", url: "https://docs.google.com/objeciones", category: "Ventas" },
    { title: "Looms", url: "https://loom.com/myworkin", category: "Videos" },
    { title: "TDRs", url: "https://docs.google.com/tdrs", category: "Legal" },
    { title: "Casos de éxito", url: "https://docs.google.com/casos", category: "Ventas" },
    { title: "One-pagers", url: "https://docs.google.com/onepagers", category: "Marketing" },
  ])

  const handleCountryToggle = (code: string) => {
    setSelectedCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]))
  }

  const handleAddTeamMember = () => {
    if (newMember.name && newMember.email) {
      setTeamMembers([...teamMembers, { ...newMember }])
      setNewMember({ name: "", email: "", role: "SDR" })
    }
  }

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleFinish = () => {
    // Set active countries
    setActiveCountries(selectedCountries)

    // Add team members
    teamMembers.forEach((member) => {
      addTeamMember({
        id: Math.random().toString(36).substring(2, 11),
        name: member.name,
        email: member.email,
        role: member.role,
      })
    })

    // Set targets
    setTargets({
      mrrTarget: Number(targets.mrrTarget),
      universitiesTarget: Number(targets.universitiesTarget),
      sqlsTarget: Number(targets.sqlsTarget),
      meetingsTarget: Number(targets.meetingsTarget),
    })

    // Add quick links
    quickLinks.forEach((link) => {
      addQuickLink({
        id: Math.random().toString(36).substring(2, 11),
        title: link.title,
        url: link.url,
        category: link.category,
      })
    })

    // Seed initial data and mark as initialized
    seedInitialData()
    setAppInitialized(true)

    toast.success("Configuración completada")
    router.push("/countries")
  }

  const steps = [
    { number: 1, title: "Países", icon: Globe },
    { number: 2, title: "Equipo", icon: Users },
    { number: 3, title: "Objetivos", icon: Target },
  ]

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
            <span className="text-2xl font-bold">MW</span>
          </div>
          <h1 className="text-3xl font-bold">Configuración inicial</h1>
          <p className="mt-2 text-white/80">Configura tu CRM de MyWorkIn en 3 simples pasos</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    step >= s.number ? "bg-white text-primary" : "bg-white/20 text-white"
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className={`mx-2 h-5 w-5 ${step > s.number ? "text-white" : "text-white/40"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Selecciona los países activos"}
              {step === 2 && "Crea tu equipo comercial"}
              {step === 3 && "Objetivos y recursos"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Elige los países donde opera MyWorkIn"}
              {step === 2 && "Agrega a los miembros de tu equipo (SDR/AE)"}
              {step === 3 && "Define tus objetivos de scorecard y links base"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Countries */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {countries.map((country) => (
                  <div
                    key={country.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      selectedCountries.includes(country.code)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleCountryToggle(country.code)}
                  >
                    <Checkbox checked={selectedCountries.includes(country.code)} />
                    <span className="font-medium">{country.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Team */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Existing members */}
                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {member.role}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTeamMember(index)}>
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new member */}
                <div className="rounded-lg border border-dashed p-4">
                  <h4 className="mb-3 text-sm font-medium">Agregar miembro</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Nombre"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                    <Select
                      value={newMember.role}
                      onValueChange={(v) => setNewMember({ ...newMember, role: v as "SDR" | "AE" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SDR">SDR</SelectItem>
                        <SelectItem value="AE">AE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handleAddTeamMember}>
                    + Agregar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Targets & Links */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Targets */}
                <div>
                  <h4 className="mb-3 font-medium">Objetivos de Scorecard</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>MRR Target (USD)</Label>
                      <Input
                        type="number"
                        value={targets.mrrTarget}
                        onChange={(e) => setLocalTargets({ ...targets, mrrTarget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Universidades Target</Label>
                      <Input
                        type="number"
                        value={targets.universitiesTarget}
                        onChange={(e) => setLocalTargets({ ...targets, universitiesTarget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SQLs Target</Label>
                      <Input
                        type="number"
                        value={targets.sqlsTarget}
                        onChange={(e) => setLocalTargets({ ...targets, sqlsTarget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reuniones Target</Label>
                      <Input
                        type="number"
                        value={targets.meetingsTarget}
                        onChange={(e) => setLocalTargets({ ...targets, meetingsTarget: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="mb-3 font-medium">Links base</h4>
                  <div className="space-y-2">
                    {quickLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{link.title}:</span>
                        <span className="truncate text-muted-foreground">{link.url}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Podrás editar estos links después en Overview</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Atrás
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)}>Siguiente</Button>
              ) : (
                <Button onClick={handleFinish}>Finalizar configuración</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
