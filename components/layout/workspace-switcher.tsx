"use client"

import { useWorkspace } from "@/lib/context/workspace-context"
import { WORKSPACES, type WorkspaceId } from "@/lib/config/workspaces"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Building2, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkspaceSwitcherProps {
  variant?: "default" | "compact" | "sidebar"
  className?: string
}

export function WorkspaceSwitcher({ variant = "default", className }: WorkspaceSwitcherProps) {
  const { workspace, setWorkspace, config } = useWorkspace()

  const getIcon = (id: WorkspaceId) => {
    return id === "myworkin" ? GraduationCap : Building2
  }

  const CurrentIcon = getIcon(workspace)

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "gap-2 font-medium",
              workspace === "mkn" && "text-black hover:bg-gray-100",
              className
            )}
          >
            <CurrentIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.shortName}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Cambiar CRM</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.values(WORKSPACES).map((ws) => {
            const Icon = getIcon(ws.id)
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setWorkspace(ws.id)}
                className="gap-3 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <p className="font-medium">{ws.displayName}</p>
                  <p className="text-xs text-muted-foreground">{ws.tagline}</p>
                </div>
                {workspace === ws.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "sidebar") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors",
              "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20",
              className
            )}
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <CurrentIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{config.shortName}</p>
              <p className="text-xs opacity-70">{config.tagline}</p>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-64">
          <DropdownMenuLabel>Cambiar CRM</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.values(WORKSPACES).map((ws) => {
            const Icon = getIcon(ws.id)
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => setWorkspace(ws.id)}
                className="gap-3 cursor-pointer py-3"
              >
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: ws.theme.primary + "15" }}
                >
                  <Icon className="h-5 w-5" style={{ color: ws.theme.primary }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{ws.displayName}</p>
                  <p className="text-xs text-muted-foreground">{ws.tagline}</p>
                </div>
                {workspace === ws.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "gap-2 border-2",
            workspace === "mkn" && "border-black text-black hover:bg-gray-50",
            className
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          {config.displayName}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Seleccionar CRM</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(WORKSPACES).map((ws) => {
          const Icon = getIcon(ws.id)
          return (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setWorkspace(ws.id)}
              className="gap-3 cursor-pointer py-3"
            >
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: ws.theme.primary + "10" }}
              >
                <Icon className="h-6 w-6" style={{ color: ws.theme.primary }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{ws.displayName}</p>
                <p className="text-sm text-muted-foreground">{ws.tagline}</p>
              </div>
              {workspace === ws.id && (
                <div 
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: ws.theme.primary }}
                >
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
