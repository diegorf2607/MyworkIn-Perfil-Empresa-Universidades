"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { 
  Building2, 
  DollarSign, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Plus,
  ExternalLink,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { 
  type Deal,
  COUNTRY_FLAGS,
  COUNTRY_NAMES,
  isActionOverdue,
  isActionToday,
  getRelativeDate,
} from "@/lib/mock-data/deals"

interface DealDrawerProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkActionDone: (dealId: string) => void
}

// Mock timeline data
const mockTimeline = [
  { type: "email", description: "Propuesta comercial enviada", date: "2026-01-20T10:30:00Z", user: "Ana García" },
  { type: "reunion", description: "Demo del producto completada", date: "2026-01-18T15:00:00Z", user: "Ana García" },
  { type: "llamada", description: "Llamada de seguimiento", date: "2026-01-15T11:00:00Z", user: "Carlos Martínez" },
  { type: "email", description: "Material informativo enviado", date: "2026-01-12T09:00:00Z", user: "Carlos Martínez" },
  { type: "reunion", description: "Discovery call inicial", date: "2026-01-10T14:00:00Z", user: "Carlos Martínez" },
]

// Mock KDM data
const mockKdm = {
  name: "Dr. Roberto Fernández",
  title: "Director de Empleabilidad",
  email: "rfernandez@empresa.com",
  linkedin: "https://linkedin.com/in/rfernandez",
}

export function DealDrawer({
  deal,
  open,
  onOpenChange,
  onMarkActionDone,
}: DealDrawerProps) {
  if (!deal) return null

  const isOverdue = deal.nextAction && isActionOverdue(deal.nextAction.date)
  const isToday = deal.nextAction && isActionToday(deal.nextAction.date)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "??"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", { 
      day: "numeric", 
      month: "short",
      year: "numeric"
    })
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      primera_reunion_programada: "1ª Reunión Programada",
      primera_reunion_realizada: "1ª Reunión Realizada",
      demo_programada: "Demo / Deep Dive",
      propuesta_enviada: "Propuesta Enviada",
      negociacion: "Negociación / Legal",
      won: "Ganada",
      lost: "Perdida",
      nurture: "Nurture",
    }
    return labels[stage] || stage
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      inbound: "Inbound",
      outbound: "Outbound",
      referido: "Referido",
    }
    return labels[source] || source
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-y-auto">
        <SheetHeader className="pb-4">
          {/* Account Header */}
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate pr-8">
                {deal.accountName}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {COUNTRY_FLAGS[deal.country]} {COUNTRY_NAMES[deal.country]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getStageLabel(deal.stage)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Owners */}
          <div className="flex items-center gap-2 mt-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10">
                {getInitials(deal.ownerName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <span className="font-medium">{deal.ownerName}</span>
              <span className="text-muted-foreground ml-1">({deal.ownerRole})</span>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Next Action Block */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Siguiente Acción
          </h3>
          
          {deal.nextAction ? (
            <div className={`p-3 rounded-lg border ${
              isOverdue ? "bg-red-50 border-red-200" :
              isToday ? "bg-amber-50 border-amber-200" :
              "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{deal.nextAction.type}</span>
                <Badge className={
                  isOverdue ? "bg-red-500" :
                  isToday ? "bg-amber-500" :
                  "bg-slate-500"
                }>
                  {isOverdue ? "Vencida" : isToday ? "Hoy" : formatDate(deal.nextAction.date)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {deal.nextAction.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => onMarkActionDone(deal.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como hecha
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Nueva acción
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-dashed bg-slate-50/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Sin acción pendiente</p>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Crear acción
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Deal Summary */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumen
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">MRR</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">
                ${deal.mrr.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 ml-1">{deal.currency}</span>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Probabilidad</span>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {deal.probability}%
              </span>
            </div>
            
            {deal.expectedCloseDate && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium">Cierre esperado</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatDate(deal.expectedCloseDate)}
                </span>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium">Fuente</span>
              </div>
              <span className="text-sm font-semibold capitalize">
                {getSourceLabel(deal.source)}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* KDM Contact */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Contacto Clave (KDM)
          </h3>
          
          <div className="p-3 rounded-lg border bg-slate-50/50">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10">
                  {getInitials(mockKdm.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{mockKdm.name}</p>
                <p className="text-xs text-muted-foreground">{mockKdm.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <a href={`mailto:${mockKdm.email}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Mail className="h-3 w-3" />
                    Email
                  </a>
                  <a href={mockKdm.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Últimas Actividades
          </h3>
          
          <div className="space-y-3">
            {mockTimeline.slice(0, 5).map((activity, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {idx < mockTimeline.length - 1 && (
                    <div className="w-px h-full bg-border flex-1 mt-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="font-medium">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{getRelativeDate(activity.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lost Reason (if applicable) */}
        {deal.status === "lost" && deal.lostReason && (
          <>
            <Separator className="my-4" />
            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Motivo de pérdida</span>
              </div>
              <p className="text-sm text-red-700">{deal.lostReason}</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
