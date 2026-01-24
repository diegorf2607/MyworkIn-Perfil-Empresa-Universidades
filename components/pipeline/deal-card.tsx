"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { 
  Building2, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  MessageSquare,
} from "lucide-react"
import { 
  type Deal, 
  COUNTRY_FLAGS,
  isActionOverdue,
  isActionToday,
  getRelativeDate,
} from "@/lib/mock-data/deals"

interface DealCardProps {
  deal: Deal
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: () => void
  isDragging: boolean
}

const actionIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-3 w-3" />,
  llamada: <Phone className="h-3 w-3" />,
  reunion: <Calendar className="h-3 w-3" />,
  demo: <Calendar className="h-3 w-3" />,
  propuesta: <FileText className="h-3 w-3" />,
  seguimiento: <MessageSquare className="h-3 w-3" />,
  nota: <MessageSquare className="h-3 w-3" />,
}

export function DealCard({
  deal,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: DealCardProps) {
  const isOverdue = deal.nextAction && isActionOverdue(deal.nextAction.date)
  const isToday = deal.nextAction && isActionToday(deal.nextAction.date)
  const isStuck = deal.stuckDays > 7

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
  }

  const getIcpColor = (tier: string) => {
    switch (tier) {
      case "A": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "B": return "bg-blue-100 text-blue-700 border-blue-200"
      case "C": return "bg-slate-100 text-slate-600 border-slate-200"
      default: return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 group",
        isDragging && "opacity-50 rotate-2 shadow-xl",
        isOverdue && "border-l-4 border-l-red-500",
        isStuck && !isOverdue && "border-l-4 border-l-amber-400"
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Header: Account + Country */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm truncate">
              {deal.accountName}
            </span>
          </div>
          <Badge variant="outline" className="text-xs h-5 px-1.5 flex-shrink-0">
            {COUNTRY_FLAGS[deal.country]} {deal.country}
          </Badge>
        </div>

        {/* Owner + Role + ICP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-primary/10">
                {getInitials(deal.ownerName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{deal.ownerName}</span>
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              {deal.ownerRole}
            </Badge>
          </div>
          <Badge className={cn("text-[10px] h-5 px-1.5 border", getIcpColor(deal.icpTier))}>
            ICP {deal.icpTier}
          </Badge>
        </div>

        {/* MRR */}
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <span className="font-semibold text-emerald-600">
            ${deal.mrr.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">{deal.currency} MRR</span>
        </div>

        {/* Next Action */}
        {deal.nextAction && (
          <div className={cn(
            "flex items-center gap-2 text-xs p-2 rounded-md",
            isOverdue ? "bg-red-50 text-red-700" :
            isToday ? "bg-amber-50 text-amber-700" :
            "bg-slate-50 text-slate-600"
          )}>
            {actionIcons[deal.nextAction.type] || <Clock className="h-3 w-3" />}
            <span className="capitalize">{deal.nextAction.type}:</span>
            <span className="font-medium">{formatDate(deal.nextAction.date)}</span>
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1 ml-auto">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                Vencida
              </Badge>
            )}
            {isToday && !isOverdue && (
              <Badge className="text-[10px] h-4 px-1 ml-auto bg-amber-500">
                Hoy
              </Badge>
            )}
          </div>
        )}

        {/* Last Activity */}
        {deal.lastActivity && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {actionIcons[deal.lastActivity.type] || <Clock className="h-3 w-3" />}
            <span className="truncate">{deal.lastActivity.description}</span>
            <span className="ml-auto flex-shrink-0">{getRelativeDate(deal.lastActivity.date)}</span>
          </div>
        )}

        {/* Stuck indicator */}
        {isStuck && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            <AlertCircle className="h-3 w-3" />
            Sin actividad hace {deal.stuckDays} días
          </div>
        )}
      </CardContent>
    </Card>
  )
}
