"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Target,
  Users,
  TrendingUp,
  Handshake,
  CheckCircle2,
  Calendar,
  Mail,
  FileText,
  Building2,
  UserCog,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  countryCode: string
}

export function Sidebar({ countryCode }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navSections = [
    {
      title: "MyWorkIn",
      items: [
        { label: "Overview", icon: LayoutDashboard, href: `/c/${countryCode}/overview` },
        { label: "Scorecards", icon: Target, href: `/c/${countryCode}/scorecards` },
      ],
    },
    {
      title: "CRM",
      items: [
        { label: "Leads (ICP)", icon: Users, href: `/c/${countryCode}/crm/leads` },
        { label: "SQLs", icon: TrendingUp, href: `/c/${countryCode}/crm/sqls` },
        { label: "Oportunidades", icon: Handshake, href: `/c/${countryCode}/crm/opps` },
        { label: "Cerradas", icon: CheckCircle2, href: `/c/${countryCode}/crm/closed` },
      ],
    },
    {
      title: "Gestión Comercial",
      items: [
        { label: "Reuniones", icon: Calendar, href: `/c/${countryCode}/sales/meetings` },
        { label: "Secuencias Outbound", icon: Mail, href: `/c/${countryCode}/sales/sequences` },
        { label: "Recursos de Venta", icon: FileText, href: `/c/${countryCode}/sales/resources` },
      ],
    },
    {
      title: "Administración",
      items: [
        { label: "Base de Universidades", icon: Building2, href: `/c/${countryCode}/admin/universities` },
        { label: "Equipo Comercial", icon: UserCog, href: `/c/${countryCode}/admin/team` },
        { label: "Glosario Comercial", icon: BookOpen, href: `/c/${countryCode}/admin/glossary` },
      ],
    },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn("flex h-16 items-center border-b border-border", collapsed ? "px-3 justify-center" : "px-4")}
        >
          <Link href="/countries" className="flex items-center gap-3">
            <Image
              src="/images/myworkin-logo.png"
              alt="MyWorkIn"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            {!collapsed && <span className="text-lg font-semibold text-foreground">MyWorkIn</span>}
          </Link>
        </div>

        <div className="border-b border-border p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/countries">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Todos los países</span>}
                </Button>
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Todos los países</TooltipContent>}
          </Tooltip>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-6">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            
                          </Link>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
