import { cookies } from "next/headers"
import { type WorkspaceId, isValidWorkspace, DEFAULT_WORKSPACE } from "@/lib/config/workspaces"

const STORAGE_KEY = "active_workspace"

/**
 * Get the active workspace from cookies (for server components/actions)
 * Falls back to DEFAULT_WORKSPACE if not set or invalid
 */
export async function getServerWorkspace(): Promise<WorkspaceId> {
  try {
    const cookieStore = await cookies()
    const stored = cookieStore.get(STORAGE_KEY)?.value
    
    if (stored && isValidWorkspace(stored)) {
      return stored
    }
  } catch {
    // cookies() might fail in some contexts, fallback to default
  }
  
  return DEFAULT_WORKSPACE
}

/**
 * Set the workspace in cookies (for API routes)
 */
export async function setServerWorkspace(workspace: WorkspaceId): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(STORAGE_KEY, workspace, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    })
  } catch {
    // Ignore errors
  }
}
