"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUpDown, Trophy, Medal } from "lucide-react"
import type { PersonPerformance } from "@/lib/mock/performance-data"

interface LeaderboardProps {
  data: PersonPerformance[]
}

type SortKey = "correos" | "respuestas" | "interesados" | "reuniones" | "sqls" | "deals" | "mrr" | "dias"

export function Leaderboard({ data }: LeaderboardProps) {
  const [search, setSearch] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [sortKey, setSortKey] = useState<SortKey>("mrr")
  const [sortAsc, setSortAsc] = useState(false)

  const getValue = (person: PersonPerformance, key: SortKey): number => {
    switch (key) {
      case "correos":
        return person.activity.correosEnviados
      case "respuestas":
        return Math.round((person.activity.correosEnviados * person.engagement.tasaRespuesta) / 100)
      case "interesados":
        return Math.round((person.activity.correosEnviados * person.engagement.tasaInteresados) / 100)
      case "reuniones":
        return person.results.reunionesAgendadas
      case "sqls":
        return person.results.sqlsGenerados
      case "deals":
        return person.results.dealsGanados
      case "mrr":
        return person.results.mrrGenerado
      case "dias":
        return person.activity.diasActivos
    }
  }

  const filteredAndSorted = data
    .filter((person) => {
      const matchesSearch = person.member.name.toLowerCase().includes(search.toLowerCase())
      const matchesRol = filterRol === "todos" || person.member.role === filterRol
      return matchesSearch && matchesRol
    })
    .sort((a, b) => {
      const aVal = getValue(a, sortKey)
      const bVal = getValue(b, sortKey)
      return sortAsc ? aVal - bVal : bVal - aVal
    })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />
    if (index === 2) return <Medal className="h-4 w-4 text-amber-600" />
    return <span className="text-muted-foreground text-sm">{index + 1}</span>
  }

  const SortHeader = ({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort(sortKeyValue)}>
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Ranking de performance por persona</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRol} onValueChange={setFilterRol}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="SDR">SDR</SelectItem>
              <SelectItem value="AE">AE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>
                  <SortHeader label="Correos" sortKeyValue="correos" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Respuestas" sortKeyValue="respuestas" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Interesados" sortKeyValue="interesados" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Reuniones" sortKeyValue="reuniones" />
                </TableHead>
                <TableHead>
                  <SortHeader label="SQLs" sortKeyValue="sqls" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Deals" sortKeyValue="deals" />
                </TableHead>
                <TableHead>
                  <SortHeader label="MRR" sortKeyValue="mrr" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Días" sortKeyValue="dias" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSorted.map((person, index) => (
                <TableRow key={person.member.id}>
                  <TableCell className="text-center">{getRankBadge(index)}</TableCell>
                  <TableCell className="font-medium">{person.member.name}</TableCell>
                  <TableCell>
                    <Badge variant={person.member.role === "SDR" ? "default" : "secondary"}>{person.member.role}</Badge>
                  </TableCell>
                  <TableCell>{person.activity.correosEnviados}</TableCell>
                  <TableCell>
                    {Math.round((person.activity.correosEnviados * person.engagement.tasaRespuesta) / 100)}
                  </TableCell>
                  <TableCell>
                    {Math.round((person.activity.correosEnviados * person.engagement.tasaInteresados) / 100)}
                  </TableCell>
                  <TableCell>{person.results.reunionesAgendadas}</TableCell>
                  <TableCell>{person.results.sqlsGenerados}</TableCell>
                  <TableCell>{person.results.dealsGanados}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${person.results.mrrGenerado.toLocaleString()}
                  </TableCell>
                  <TableCell>{person.activity.diasActivos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
