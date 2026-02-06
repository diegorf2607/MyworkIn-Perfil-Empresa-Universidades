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
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/lib/context/workspace-context"

interface SidebarProps {
  countryCode: string
}

export function Sidebar({ countryCode }: SidebarProps) {
  const pathname = usePathname()
  const { config } = useWorkspace()
  const [collapsed, setCollapsed] = useState(false)

  const navSections = [
    {
      title: config.shortName,
      items: [
        { label: "Overview", icon: LayoutDashboard, href: `/c/${countryCode}/overview` },
        { label: "Scorecards", icon: Target, href: `/c/${countryCode}/scorecards` },
      ],
    },
    {
      title: "CRM",
      items: [
        { label: config.terminology.leadsTitle, icon: Users, href: `/c/${countryCode}/crm/leads` },
        { label: "SQLs", icon: TrendingUp, href: `/c/${countryCode}/crm/sqls` },
        { label: "Oportunidades", icon: Handshake, href: `/c/${countryCode}/crm/opps` },
        { label: config.terminology.closedTitle, icon: CheckCircle2, href: `/c/${countryCode}/crm/closed` },
      ],
    },
    {
      title: "Gestión Comercial",
      items: [
        { label: "Reuniones", icon: Calendar, href: `/c/${countryCode}/sales/meetings` },
        { label: "Secuencias Outbound", icon: Mail, href: `/c/${countryCode}/sales/sequences` },
      ],
    },
    {
      title: "Administración",
      items: [
        { label: config.terminology.databaseTitle, icon: Building2, href: `/c/${countryCode}/admin/universities` },
      ],
    },
  ]

  // Color de fondo dinámico según workspace
  const sidebarBg = config.id === "mkn" ? "bg-black" : "bg-sidebar"

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col border-r border-border transition-all duration-300",
          sidebarBg,
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center border-b",
            config.id === "mkn" ? "border-white/15" : "border-border",
            collapsed ? "px-3 justify-center" : "px-4"
          )}
        >
          <Link href="/countries" className="flex items-center gap-3">
            {config.id === "mkn" ? (
              <>
                {collapsed ? (
                  <span className="text-lg font-bold text-white">M</span>
                ) : (
                  <Image
                    src="/images/mkn-logo.png"
                    alt="MKN Technologies"
                    width={320}
                    height={80}
                    className="h-14 w-auto object-contain"
                  />
                )}
              </>
            ) : (
              <>
                <Image
                  src="/images/myworkin-logo.png"
                  alt="MyWorkIn"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                {!collapsed && <span className="text-lg font-semibold text-foreground">{config.displayName}</span>}
              </>
            )}
          </Link>
        </div>

        <div className={cn("border-b p-3", config.id === "mkn" ? "border-white/15" : "border-border")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/all/overview">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    config.id === "mkn" 
                      ? "text-white/80 hover:bg-white/10 hover:text-white" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
                  <h3 className={cn(
                    "mb-2 px-3 text-xs font-semibold uppercase tracking-wider",
                    config.id === "mkn" ? "text-white/60" : "text-muted-foreground"
                  )}>
                    {section.title}
                  </h3>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link href={item.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3",
                                collapsed && "justify-center px-2",
                                config.id === "mkn"
                                  ? isActive
                                    ? "bg-white/20 text-white hover:bg-white/30"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                  : isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              {!collapsed && <span>{item.label}</span>}
                            </Button>
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

        <div className={cn("border-t p-3", config.id === "mkn" ? "border-white/15" : "border-border")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-center",
              config.id === "mkn" ? "text-white/80 hover:bg-white/10" : "text-muted-foreground"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
