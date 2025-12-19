import type React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AllLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar countryCode="ALL" />
      <SidebarInset>
        <Topbar countryCode="ALL" />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
