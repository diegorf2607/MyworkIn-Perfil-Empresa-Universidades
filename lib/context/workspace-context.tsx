"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { 
  type WorkspaceId, 
  type WorkspaceConfig, 
  type WorkspaceTerminology,
  getWorkspaceConfig, 
  isValidWorkspace,
  DEFAULT_WORKSPACE 
} from "@/lib/config/workspaces"

const STORAGE_KEY = "active_workspace"
const COOKIE_NAME = "active_workspace"

interface WorkspaceContextValue {
  // Estado actual
  workspace: WorkspaceId
  config: WorkspaceConfig
  
  // Acciones
  setWorkspace: (id: WorkspaceId) => void
  
  // Helper para términos
  t: (key: keyof WorkspaceTerminology) => string
  
  // Theme helpers
  theme: WorkspaceConfig["theme"]
  
  // Estado de carga
  isLoading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

interface WorkspaceProviderProps {
  children: ReactNode
  initialWorkspace?: WorkspaceId
}

export function WorkspaceProvider({ children, initialWorkspace }: WorkspaceProviderProps) {
  const [workspace, setWorkspaceState] = useState<WorkspaceId>(initialWorkspace || DEFAULT_WORKSPACE)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar workspace desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isValidWorkspace(stored)) {
      setWorkspaceState(stored)
    }
    setIsLoading(false)
  }, [])

  // Cambiar workspace
  const setWorkspace = useCallback((id: WorkspaceId) => {
    if (isValidWorkspace(id)) {
      setWorkspaceState(id)
      localStorage.setItem(STORAGE_KEY, id)
      
      // Also set cookie for server-side access
      document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
      
      // Aplicar CSS variables del theme
      const config = getWorkspaceConfig(id)
      document.documentElement.style.setProperty("--workspace-primary", config.theme.primary)
      document.documentElement.style.setProperty("--workspace-primary-foreground", config.theme.primaryForeground)
      document.documentElement.style.setProperty("--workspace-accent", config.theme.accent)
      document.documentElement.style.setProperty("--workspace-sidebar", config.theme.sidebar)
      document.documentElement.style.setProperty("--workspace-sidebar-foreground", config.theme.sidebarForeground)
    }
  }, [])

  // Aplicar theme inicial
  useEffect(() => {
    const config = getWorkspaceConfig(workspace)
    document.documentElement.style.setProperty("--workspace-primary", config.theme.primary)
    document.documentElement.style.setProperty("--workspace-primary-foreground", config.theme.primaryForeground)
    document.documentElement.style.setProperty("--workspace-accent", config.theme.accent)
    document.documentElement.style.setProperty("--workspace-sidebar", config.theme.sidebar)
    document.documentElement.style.setProperty("--workspace-sidebar-foreground", config.theme.sidebarForeground)
  }, [workspace])

  const config = getWorkspaceConfig(workspace)

  // Helper para obtener términos
  const t = useCallback((key: keyof WorkspaceTerminology): string => {
    return config.terminology[key] as string
  }, [config])

  const value: WorkspaceContextValue = {
    workspace,
    config,
    setWorkspace,
    t,
    theme: config.theme,
    isLoading,
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// Hook para usar el workspace
export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}

// Hook opcional para solo obtener el ID (sin error si no hay provider)
export function useWorkspaceId(): WorkspaceId {
  const context = useContext(WorkspaceContext)
  return context?.workspace || DEFAULT_WORKSPACE
}
