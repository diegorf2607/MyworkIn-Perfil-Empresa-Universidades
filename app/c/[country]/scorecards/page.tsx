"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Calendar,
  Target,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { getScorecards, upsertScorecard } from "@/lib/actions/scorecards"
import { getTasks, createTask, updateTask } from "@/lib/actions/tasks"
import { getAccounts } from "@/lib/actions/accounts"
import { getOpportunities } from "@/lib/actions/opportunities"
import { getMeetings } from "@/lib/actions/meetings"

interface Scorecard {
  id: string
  country_code: string
  date: string
  cash_collected: number | null
  mrr_generated: number | null
  universities_won: number | null
  new_sqls: number | null
  meetings_done: number | null
  new_icp_accounts: number | null
}

interface Task {
  id: string
  country_code: string
  title: string
  account_id: string | null
  due_date: string
  status: "pending" | "completed"
}

export default function ScorecardsPage() {
  const { country } = useParams<{ country: string }>()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  const [scorecards, setScorecards] = useState<Scorecard[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [funnelData, setFunnelData] = useState({ leads: 0, sqls: 0, opps: 0, won: 0 })
  const [realTimeKpis, setRealTimeKpis] = useState({
    cashCollected: 0,
    mrrGenerated: 0,
    universitiesWon: 0,
    newSqls: 0,
    meetingsDone: 0,
    newIcpAccounts: 0,
  })

  const [editingEntry, setEditingEntry] = useState<Scorecard | null>(null)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [scorecardsData, tasksData, accountsData, oppsData, meetingsData] = await Promise.all([
        getScorecards(country),
        getTasks(country),
        getAccounts(country),
        getOpportunities(country),
        getMeetings(country),
      ])

      setScorecards((scorecardsData as Scorecard[]) || [])
      setTasks((tasksData as Task[]) || [])

      // Calculate funnel from accounts
      const countryAccounts = accountsData || []
      const countryOpps = oppsData || []
      const countryMeetings = meetingsData || []

      setFunnelData({
        leads: countryAccounts.filter((a: any) => a.stage === "lead").length,
        sqls: countryAccounts.filter((a: any) => a.stage === "sql").length,
        opps: countryAccounts.filter((a: any) => a.stage === "opp").length,
        won: countryOpps.filter((o: any) => o.stage === "won").length,
      })

      // Calculate real-time KPIs
      const wonOpps = countryOpps.filter((o: any) => o.stage === "won")
      const totalMrrWon = wonOpps.reduce((sum: number, o: any) => sum + (o.mrr || 0), 0)
      const newSqls = countryAccounts.filter((a: any) => a.stage === "sql").length
      const completedMeetings = countryMeetings.filter((m: any) => m.outcome && m.outcome !== "pending").length
      const icpAccounts = countryAccounts.filter((a: any) => (a.icp_fit || 0) >= 70).length

      setRealTimeKpis({
        cashCollected: totalMrrWon, // Simplified: cash = mrr for now
        mrrGenerated: totalMrrWon,
        universitiesWon: wonOpps.length,
        newSqls,
        meetingsDone: completedMeetings,
        newIcpAccounts: icpAccounts,
      })
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [country])

  useEffect(() => {
    loadData()
  }, [loadData])

  const displayEntries = scorecards.slice(0, 14)

  const countryTasks = tasks.filter((t) => t.status === "pending")

  const sqlToOppRate = funnelData.sqls > 0 ? Math.round((funnelData.opps / funnelData.sqls) * 100) : 0
  const winRate = funnelData.opps > 0 ? Math.round((funnelData.won / (funnelData.opps + funnelData.won)) * 100) : 0

  const handleSaveEntry = () => {
    if (!editingEntry) return
    startTransition(async () => {
      try {
        await upsertScorecard({
          country_code: country,
          date: editingEntry.date,
          cash_collected: editingEntry.cash_collected || 0,
          mrr_generated: editingEntry.mrr_generated || 0,
          universities_won: editingEntry.universities_won || 0,
          new_sqls: editingEntry.new_sqls || 0,
          meetings_done: editingEntry.meetings_done || 0,
          new_icp_accounts: editingEntry.new_icp_accounts || 0,
        })
        toast.success("Entrada actualizada")
        setEditingEntry(null)
        loadData()
      } catch (error) {
        toast.error("Error al actualizar")
        console.error(error)
      }
    })
  }

  const handleAddTask = () => {
    if (!newTaskTitle) return
    startTransition(async () => {
      try {
        await createTask({
          country_code: country,
          title: newTaskTitle,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "pending",
        })
        setNewTaskTitle("")
        setNewTaskOpen(false)
        toast.success("Tarea creada")
        loadData()
      } catch (error) {
        toast.error("Error al crear tarea")
        console.error(error)
      }
    })
  }

  const handleToggleTask = (taskId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await updateTask({ id: taskId, status: completed ? "completed" : "pending" })
        loadData()
      } catch (error) {
        toast.error("Error al actualizar tarea")
        console.error(error)
      }
    })
  }

  const kpis = [
    {
      label: "Cash Collected",
      value: `$${realTimeKpis.cashCollected.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "MRR Generado",
      value: `$${realTimeKpis.mrrGenerated.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    { label: "Universidades Cerradas", value: realTimeKpis.universitiesWon, icon: Building2, color: "text-primary" },
    { label: "SQLs Nuevos", value: realTimeKpis.newSqls, icon: Users, color: "text-purple-600" },
    { label: "Reuniones Realizadas", value: realTimeKpis.meetingsDone, icon: Calendar, color: "text-orange-600" },
    { label: "Cuentas ICP Nuevas", value: realTimeKpis.newIcpAccounts, icon: Target, color: "text-cyan-600" },
    { label: "Conversión SQL→OPP", value: `${sqlToOppRate}%`, icon: ArrowUpRight, color: "text-emerald-600" },
    { label: "Win Rate", value: `${winRate}%`, icon: ChevronRight, color: "text-indigo-600" },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scorecard Table */}
      <Card>
        <CardHeader className="p-8 pb-0">
          <CardTitle>Scorecard Diario</CardTitle>
          <CardDescription>Últimos 14 días de actividad</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                  <th className="px-3 py-2 text-right font-medium">Cash</th>
                  <th className="px-3 py-2 text-right font-medium">MRR</th>
                  <th className="px-3 py-2 text-right font-medium">Unis Won</th>
                  <th className="px-3 py-2 text-right font-medium">SQLs</th>
                  <th className="px-3 py-2 text-right font-medium">Reuniones</th>
                  <th className="px-3 py-2 text-right font-medium">ICP Nuevas</th>
                  <th className="px-3 py-2 text-center font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {displayEntries.map((entry) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="px-3 py-2">
                      {new Date(entry.date).toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-3 py-2 text-right">${Number(entry.cash_collected || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">${Number(entry.mrr_generated || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{entry.universities_won || 0}</td>
                    <td className="px-3 py-2 text-right">{entry.new_sqls || 0}</td>
                    <td className="px-3 py-2 text-right">{entry.meetings_done || 0}</td>
                    <td className="px-3 py-2 text-right">{entry.new_icp_accounts || 0}</td>
                    <td className="px-3 py-2 text-center">
                      <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
                {displayEntries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No hay datos de scorecard
                    </td>
                  </tr>
                )}
                {displayEntries.length > 0 && (
                  <tr className="bg-muted/50 font-medium">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">
                      $
                      {displayEntries
                        .reduce((sum, entry) => sum + Number(entry.cash_collected || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      $
                      {displayEntries
                        .reduce((sum, entry) => sum + Number(entry.mrr_generated || 0), 0)
                        .toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {displayEntries.reduce((sum, entry) => sum + Number(entry.universities_won || 0), 0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {displayEntries.reduce((sum, entry) => sum + Number(entry.new_sqls || 0), 0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {displayEntries.reduce((sum, entry) => sum + Number(entry.meetings_done || 0), 0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {displayEntries.reduce((sum, entry) => sum + Number(entry.new_icp_accounts || 0), 0)}
                    </td>
                    <td className="px-3 py-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Funnel + Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <Card>
          <CardHeader className="p-8 pb-0">
            <CardTitle>Funnel de Ventas</CardTitle>
            <CardDescription>Estado actual del pipeline</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <div className="space-y-4">
              {[
                { label: "Leads (ICP)", value: funnelData.leads, color: "bg-blue-500" },
                { label: "SQLs", value: funnelData.sqls, color: "bg-purple-500" },
                { label: "Oportunidades", value: funnelData.opps, color: "bg-orange-500" },
                { label: "Cerradas Won", value: funnelData.won, color: "bg-green-500" },
              ].map((stage) => (
                <div key={stage.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{stage.label}</span>
                    <span className="font-medium">{stage.value}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className={`h-3 rounded-full ${stage.color}`}
                      style={{ width: `${Math.min(100, (stage.value / (funnelData.leads || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Próximas acciones</CardTitle>
              <CardDescription>{countryTasks.length} tareas pendientes</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setNewTaskOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-8">
            <div className="space-y-3">
              {countryTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                    disabled={isPending}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {new Date(task.due_date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              ))}
              {countryTasks.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No hay tareas pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar entrada del {editingEntry?.date}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cash Collected</label>
              <Input
                type="number"
                value={editingEntry?.cash_collected || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, cash_collected: Number(e.target.value) } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">MRR Generado</label>
              <Input
                type="number"
                value={editingEntry?.mrr_generated || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, mrr_generated: Number(e.target.value) } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Universidades Won</label>
              <Input
                type="number"
                value={editingEntry?.universities_won || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, universities_won: Number(e.target.value) } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SQLs Nuevos</label>
              <Input
                type="number"
                value={editingEntry?.new_sqls || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, new_sqls: Number(e.target.value) } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reuniones Done</label>
              <Input
                type="number"
                value={editingEntry?.meetings_done || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, meetings_done: Number(e.target.value) } : null))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ICP Nuevas</label>
              <Input
                type="number"
                value={editingEntry?.new_icp_accounts || 0}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, new_icp_accounts: Number(e.target.value) } : null))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEntry} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Descripción de la tarea..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTask} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
